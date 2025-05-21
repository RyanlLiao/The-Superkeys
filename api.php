<?php

header("Content-Type: application/json");

$requestBody = file_get_contents('php://input');
$object = json_decode($requestBody, true);

class API
{
    private $connection;

    public static function instance()
    {
        static $instance = null;
        if ($instance === null)
            $instance = new API();

        return $instance;
    }

    private function __construct()
    {
        require_once "config.php";
        $this->connection = Database::getInstance()->connect();
    }

    public function __destruct()
    {
        $this->connection = null;
    }

    //////////////  HANDLING REQUESTS   /////////////

    //this function will validate request types
    public function request($object, $request)
    {
        if ($request !== "POST")
            return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Request Type", null);

        if (!$object)
            return $this->response("HTTP/1.1 400 Bad Request", "error", "Null Object", null);

        if (!isset($object['type']) && $object['type'] == "")
            return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing POST parameter", null);


        $types = ["Register", "Login", "Products", "Prices", "Retailers", "Reviews", "GetWishlist", "AddWishlist", "RemoveWishlist"];        //might add admin
        $valid = $this->arrayCheck($object["type"], $types);

        if (!$valid)
            return $this->response("HTTP/1.1 400 Bad Request", "error", "Unrecognised Post type", null);

        return true;
    }

    //this function will validate request data
    public function validate($data)
    {
        //clean data
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                foreach ($data[$key] as $innerkey => $innervalue) {
                    if (is_string($innervalue))
                        $data[$key][$innerkey] = htmlspecialchars(trim($innervalue));
                }
            } else {
                if (is_string($value))
                    $data[$key] = htmlspecialchars(trim($value));
            }
        }

        //check api key 

        if (isset($data['apikey']) && !$this->checkApikey($data['apikey']))
            return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);


        $type = $data['type'];

        switch ($type) {
            case "Register":
                $name = $data["name"];
                $surname = $data["surname"];
                $email = $data["email"];
                $password = $data["password"];
                $confirm = $data["password_confirm"];
                $user = $data["user_type"];

                $empty = $name === "" || $surname === "" || $email === "" || $password === "" || $confirm === "" || $user === "";
                $email_check = preg_match('/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/', $email);
                $pass_check = preg_match('/^((?=.*\W)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])).{8,}$/', $password);

                if ($empty || !$email_check || !$pass_check)
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing or Invalid parameters", null);

                $statement = $this->connection->prepare("SELECT * FROM studentnumber_users WHERE email= ?");
                $statement->bind_param("s", $email);
                $statement->execute();

                $result = $statement->get_result();
                $result = $result->fetch_assoc();

                if ($result)
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Email already exists", null);

                $apikey = bin2hex(random_bytes(16));
                return $this->response("HTTP/1.1 200 OK", "success", "", ['apikey' => $apikey]);

            case "Login":
                $email = $data["email"];
                $password = $data["password"];

                $empty = $email == "" || $password == "";
                if ($empty) {
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Credentials", null);
                }

                return $this->login($email, $password);

            case "Products":
                //return
                $return = $data['return'];

                if ($return == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Post Parameter", null);

                if ($return == "*" || is_array($return))
                    return $this->getProducts($data);

                return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Post Parameter", null);

            case "Prices":
                break;
            case "Retailers":
                break;
            case "Reviews":
                break;
            case "GetWishlist":
                $apikey = $data['apikey'];

                return $this -> getWishlist($apikey);
            case: "AddWishlist":
                $apikey = $data['apikey'];
                $pid = $data['pid'];

                if ($pid == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Product ID", null);

                return $this->addWishlist($apikey, $pid);
            case: "RemoveWishlist":
                $apikey = $data['apikey'];
                $pid = $data['pid'];

                if ($pid == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Product ID", null);

                return $this->removeWishlist($apikey, $pid);
            default:
                return $this->response("HTTP/1.1 400 Bad Request", "error", "Unrecognised Post type", null);
        }

    }

    //this function will check if the passed in paramater is an array of allowed values
    private function arrayCheck($param, $allowed)
    {
        if ($param == null)
            return false;

        if (gettype($param) !== 'array')
            $param = [$param];

        $valid = array_intersect($allowed, $param);
        if (sizeof($valid) <= 0)
            return false;

        return true;
    }

    //verifies that the apikey is valid
    private function checkApikey($apikey)
    {
        if (empty($apikey))
            return false;

        $statement = $this->connection->prepare("SELECT id FROM studentnumber_users WHERE api_key = ?");
        $statement->bind_param("s", $apikey);
        $statement->execute();

        $result = $statement->get_result();
        $result = $result->fetch_assoc();

        if ($result)
            return true;

        return false;
    }

    /////ALL FUNCTION FROM THIS POINT ASSUME DATA HAS BEEN VALIDATED/////

    //logs in the passed in user   
    private function login($email, $password)
    {
        $query = "SELECT api_key, salt, password,name FROM studentnumber_users WHERE email = ?";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("s", $email);
        $statement->execute();

        $result = $statement->get_result();
        $result = $result->fetch_assoc();
        if (!$result)
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid credentials", null);


        $salt = $result["salt"];
        $open = $password . $salt;
        $safe = hash("sha256", $open);
        if ($result["password"] != $safe)
            return $this->response("HTTP/1.1 404 BAD REQUEST", "error", "Invalid Credentials", null);

        return $this->response("HTTP/1.1 200 OK", "success", "", ['apikey' => $result['apikey'], 'fname' => $result['name']]);
    }

    //adds a user to the database of registered users

    //this build the api response 
    private function response($header, $result, $message, $data)
    {
    }

    //this will get products from the database - only manager apikeys will be valid
    private function getProducts($data)
    {
        $allowed = [
            "id",
            "title",
            "brand",
            "description",
            "initial_price",
            "final_price",
            "categories",
            "image_url",
            "product_dimensions",
            "date_first_available",
            "manufacturer",
            "department",
            "features",
            "is_available",
            "images",
            "country_of_origin",
            "price_min",
            "price_max"
        ];

        //input validation
        $return = $data["return"] === "*" ? "*" : array_intersect($data["return"], $allowed);
        $search = empty($data["search"]) ? null : array_intersect_key($data["search"], array_flip($allowed));
        $sort = isset($data["sort"]) && in_array($data["sort"], $allowed) ? $data["sort"] : null;
        $limit = isset($data["limit"]) && is_numeric($data["limit"]) && $data["limit"] > 0 ? $data["limit"] : null;
        $fuzzy = isset($data["fuzzy"]) && in_array($data["fuzzy"], [true, false]) ? $data["fuzzy"] : null;

        $order = null;
        if (isset($data["order"])) {
            $temp = strtoupper(trim($data["order"]));
            $order = in_array($temp, ["ASC", "DESC"]) ? $temp : null;
        }

        //SELECT
        if ($sort != null && $return !== '*' && !in_array($sort, $return))   //adding sort to select incase its not part of return
            $return[] = $sort;

        //adding in currency to set default 
        if ($return !== '*')
            $return[] = "currency";


        $select = ($return === "*") ? "*" : implode(",", $return);

        //WHERE
        $where = [];
        $parameters = [];
        $vartypes = "";

        if ($search != null) {

            foreach ($search as $key => $value) {

                if ($key === "price_min") {
                    $where[] = "final_price >= ?";
                    $parameters[] = (int) $value;
                    $vartypes .= "i";
                } else if ($key === "price_max") {
                    $where[] = "final_price <= ?";
                    $parameters[] = (int) $value;
                    $vartypes .= "i";
                } else if ($key === "id" && is_array($value)) {
                    $placeholders = implode(",", array_fill(0, count($value), '?'));
                    $where[] = "id IN ($placeholders)";
                    foreach ($value as $id) {
                        $parameters[] = (int) $id;
                        $vartypes .= "i";
                    }
                } else {
                    if ($fuzzy === false) {
                        $where[] = "$key = ?";
                        $parameters[] = $value;
                        $vartypes .= "s";
                    } else {
                        $where[] = "$key LIKE ?";
                        $parameters[] = "%" . $value . "%";
                        $vartypes .= "s";
                    }
                }
            }
        }

        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
        //limit
        $limitClause = ($limit != null) ? "LIMIT " . $limit : "";

        //get rows
        $query = "SELECT  $select  FROM studentnumber_products $whereClause  ORDER BY RAND()  $limitClause";
        $statement = $this->connection->prepare($query);

        empty($parameters) ? $statement->execute() : $statement->execute($parameters);

        if (!empty($parameters))
            $statement->bind_param($vartypes, $parameters);

        $statement->execute();
        $result = $statement->get_result();
        $result = $result->fetch_assoc();

        //converting currencies 
        if ($return === "*" || in_array("final_price", $return) || in_array("initial_price", $return)) {
            $currencyList = $this->currency();

            for ($i = 0; $i < count($result); $i++) {
                $result[$i] = $this->convert($currencyList, $result[$i]);
            }
        }

        //Sorting
        if ($sort !== null) {
            usort($result, function ($a, $b) use ($sort, $order) {
                if ($order === "ASC")
                    return $a[$sort] <=> $b[$sort];
                else
                    return $b[$sort] <=> $a[$sort];
            });
        }


        if ($return !== "*") {
            foreach ($result as &$row) {
                unset($row["currency"]);
            }
            unset($row);
        }


        //remove sort if it wasn't in the return
        if ($sort != null && $return !== "*" && !in_array($sort, $data["return"])) {   //adding sort to select incase its not part of return
            //echo "removing sort\n";
            foreach ($result as &$row)
                unset($row[$sort]);

            unset($row);
        }

        return $result;

    }

    //this will add products to the table - only manager apikeys will be valid
    private function addProducts($product)
    {
        $query = "INSERT INTO studentnumber_products VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        $statement = $this->connection->prepare($query);
        $statement->bind_param(
            "sssddssssssssiss",
            $product['title'],
            $product['brand'],
            $product['description'],
            $product['initial_price'],
            $product['final_price'],
            $product['currency'],
            $product['categories'],
            $product['image_url'],
            $product['product_dimensions'],
            $product['date_first_available'],
            $product['manufacturer'],
            $product['department'],
            $product['features'],
            $product['is_available'],
            $product['images'],
            $product['country_of_origin']
        );
        
        if(!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        return $this->response("HTTP/1.1 200 OK", "success", "product added successfyllu",null);
    }

    //this will remove products from the tables - only manager apikeys will be valid
    private function removeProduct($apikey, $pid)
    {
        $query = "DELETE FROM studentnum_products WHERE id=?";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("i",$pid);
        
        if(!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't remove product", null);

        return $this->response("HTTP/1.1 200 OK", "success", "product removed successfully",null);
    }

    //this will update the prices that a retailer sells a product at
    //it takes in an associative array {productID: {retailer: price}, {retailer: price},...}
    //only manager apikeys will be accepted

    //this adds a new retailer - only manager apikeys will be accepted
    private function addRetailer($apikey/*, retailer information*/)
    {
        
    }

    //this removes a retailer from the table - only manager apikeys will be accepted
    private function removeRetailer($apikey, $rid)
    {
    }

    //this will update the information (price) for a product
    //it takes in an associative array {productID: , changes: []};
    private function updateProduct($apikey, $product_retailer)
    {
    }

    //this fetches a currency list
    private function currency()
    {
        $curl = curl_init("https://wheatley.cs.up.ac.za/api/");

        $body = array(
            "studentnum" => "student_number",
            "apikey" => "apikey (.env file???)",
            "type" => "GetCurrencyList"
        );

        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($curl);
        curl_close($curl);

        $result = json_decode($result, true);
        if ($result && isset($result["data"])) {
            return $result["data"];
        }
        return null;
    }

    //this updates the currency of prices for a row
    private function convert($currencyList, $row)
    {
        $current = $row["currency"];
        $target = "ZAR";
        $exchange = $currencyList[$target] / $currencyList[$current];

        foreach ($row as $key => $value) {
            if (strpos($key, "price") !== false) {
                $row[$key] = round($value * $exchange, 2);
            }
        }

        return $row;
    }

    //this will add a users review for a product from a specific retailer
    //it takes in an associative array {productID: retailer};
    private function addReview($apikey, $product_retailer)
    {
    }

    private function removeReview($apikey, $product_retailer)
    {
    }

    //this will add a users comment for a product from a retailer
    //it takes in an associative array {productID: retailer};
    private function addComment($apikey, $product_retailer, $comment)
    {
    }

    private function removeComment($apikey, $product_retailer)
    {
    }
    //this adds the passed in product to the users wishlist
    private function addWishlist($apikey, $pid)
    {
        $query = "SELECT id FROM u24573699_users WHERE api_key = ?";
        $pstmt = $this -> connection -> prepare($query);
        if(!$pstmt)
            return $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt -> bind_param("s", $apikey);
        $pstmt -> execute();
        $pstmt -> store_result();
        if ($pstmt -> num_rows > 0) {
            $pstmt -> bind_result($userID);
            $pstmt -> fetch();
        } else {
            $this -> response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }
        $pstmt -> close();
        
        //check if product id exists
        $query = 'SELECT id FROM u24573699_products WHERE id = ?';
        $pstmt = $this -> mysqli -> prepare($query);
        if(!$pstmt){
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt -> bind_param('s', $pid);
        $pstmt -> execute();
        $pstmt -> store_result();
        if ($pstmt -> num_rows == 0) {
            $this -> response("HTTP/1.1 404 NOT FOUND", "error", "Product does not exist", null);
        }
        $pstmt -> close();

        //check if product is already in wishlist
        $query = 'SELECT id FROM u24573699_wishlist WHERE user_id = ? AND product_id = ?';
        $pstmt = $this -> mysqli -> prepare($query);
        if (!$pstmt) {
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt -> bind_param('ii', $userID, $pid);
        $pstmt -> execute();
        $pstmt -> store_result();
        if($pstmt -> num_rows > 0){
            $this -> response("HTTP/1.1 400 BAD REQUEST", "error", "Product already in wishlist", null);
        }
        $pstmt -> close();

        $query = 'INSERT INTO u24573699_wishlist (user_id, product_id) VALUES (?, ?)';
        $pstmt = $this -> mysqli -> prepare($query);
        if (!$pstmt) {
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }

        $pstmt -> bind_param('iis', $userID, $pid);
        if (!$pstmt -> execute()) {
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt -> close();
        return $this -> response("HTTP/1.1 200 OK", "success", "Product added to wishlist", null);
    }

    //this removes the passed in product from the users wishlist
    private function removeWishlist($apikey, $pid)
    {
        $query = "SELECT id FROM u24573699_users WHERE api_key = ?";
        $pstmt = $this -> connection -> prepare($query);
        if(!$pstmt)
            return $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt -> bind_param("s", $apikey);
        $pstmt -> execute();
        $pstmt -> store_result();
        if ($pstmt -> num_rows > 0) {
            $pstmt -> bind_result($userID);
            $pstmt -> fetch();
        } else {
            $this -> response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }
        $pstmt -> close();

        $query = 'SELECT id FROM u24573699_wishlist WHERE user_id = ? AND product_id = ?';
        $pstmt = $this -> mysqli -> prepare($query);
        if (!$pstmt) {
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt -> bind_param('ii', $userID, $pid);
        $pstmt -> execute();
        $pstmt -> store_result();
        if ($pstmt -> num_rows == 0) {
            $this -> response("HTTP/1.1 404 NOT FOUND", "error", "Product not in wishlist", null);
        }
        $pstmt -> close();

        $query = 'DELETE FROM u24573699_wishlist WHERE user_id = ? AND product_id = ?';
        $pstmt = $this -> mysqli -> prepare($query);
        if (!$pstmt) {
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt -> bind_param('ii', $userID, $pid);
        if (!$pstmt -> execute()) {
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt -> close();
        return $this -> response("HTTP/1.1 200 OK", "success", "Product removed from wishlist", null);
    }

    //this gets everything a a users wishlist
    private function getWishlist($apikey)
    {
        $query = "SELECT id FROM u24573699_users WHERE api_key = ?";
        $pstmt = $this -> connection -> prepare($query);
        if(!$pstmt)
            return $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt -> bind_param("s", $apikey);
        $pstmt -> execute();
        $pstmt->store_result();
        if ($pstmt -> num_rows === 0) {
            $this -> response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }
        $pstmt -> bind_result($userID);
        $pstmt -> fetch();
        $pstmt -> close();
        
        $query = 'SELECT * FROM u24573699_products u_p ' . 
                  'JOIN u24573699_wishlist u_w ' .
                  'ON u_p.id = u_w.product_id ' .
                  'WHERE u_w.user_id = ?';

        $pstmt = $this -> mysqli -> prepare($query);
        if (!$pstmt) {
            $this -> response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }

        $pstmt -> bind_param('i', $userID);
        $pstmt -> execute();
        $result = $pstmt -> get_result();

        $wishlist = [];
        while ($row = $result -> fetch_assoc()) {
            $wishlist[] = $row;
        }
        $pstmt -> close();

        return $this -> response("HTTP/1.1 200 OK", "success", "", ['wishlist' => $wishlist]);
    }

    //to change the price of an item
    private function updatePrice($apikey, $price, $retailer, $product, $date)
    {

    }
}


$API = API::instance();
$request = $_SERVER["REQUEST_METHOD"];

?>