<?php

header("Content-Type: application/json");

class API
{
    private $connection;
    private $db;

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


        $types = ["Register", "Login", "Products", "Prices", "Retailers", "Reviews", "Wishlist"];        //might add admin
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

                $statement = $this->connection->prepare("SELECT * FROM Person WHERE email= ?");
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
                echo $return . "\n";
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
            case "Wishlist":
                break;
            default:
                return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid type", null);

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

        $statement = $this->connection->prepare("SELECT id FROM Person WHERE api_key = ?");
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
        $query = "SELECT api_key, salt, password,name FROM Person WHERE email = ?";
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
          header($header);
        header("Content-Type: application/json");

         if ($result == "success") {
            return json_encode([
                "status" => $result,
                "timestamp" => time(),
                "data" => $data
            ]);
        } else {
            return json_encode([
                "status" => $result,
                "timestamp" => time(),
                "message" => $message
            ]);
        }
    }

    private function getWhitelist()
    {
        $allowed = [
            "product_id",
            "product_name",
            "description",
            "type",
            "availability",
            "average_rating",
            "images",
            "retailer",
            "price",
            "price_min",
            "price_max",
        ];
        return $allowed;
    }

    //this will get products from the database - only manager apikeys will be valid
    private function getProducts($data)
    {
        $allowed = $this->getWhitelist();

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


        $select = ($return === "*") ? "*" : implode(",", $return);

        //WHERE
        $where = [];
        $parameters = [];
        $vartypes = "";

        if ($search != null) {
            foreach ($search as $key => $value) {

                if ($key === "price_min") {
                    $where[] = "price >= ?";
                    $parameters[] = (int) $value;
                    $vartypes .= "d";
                } else if ($key === "price_max") {
                    $where[] = "price <= ?";
                    $parameters[] = (int) $value;
                    $vartypes .= "d";
                } else if (is_array($value)) {
                    $placeholders = implode(",", array_fill(0, count($value), '?'));
                    $where[] = "$key IN ($placeholders)";
                    foreach ($value as $item) {
                        $parameters[] = (int) $item;
                        $vartypes .= "s";
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
        $query = "SELECT  $select  FROM Product NATURAL JOIN Sold_by $whereClause  ORDER BY RAND()  $limitClause";
        $statement = $this->connection->prepare($query);

        if (!empty($parameters))
            $statement->bind_param($vartypes, $parameters);

        $statement->execute();
        $result = $statement->get_result();
        $result = $result->fetch_all(MYSQL_ASSOC);

        //Sorting
        if ($sort !== null) {
            usort($result, function ($a, $b) use ($sort, $order) {
                if ($order === "ASC")
                    return $a[$sort] <=> $b[$sort];
                else
                    return $b[$sort] <=> $a[$sort];
            });
        }

        return $result;
    }

    //this will add products to the table - only manager apikeys will be valid
    private function addProducts($product)
    {

        $query = "INSERT INTO Product (product_name,description,type,availability,average_rating,images) VALUES(?,?,?,?,?,?)";

        $statement = $this->connection->prepare($query);
        $statement->bind_param(
            "sssifs",
            $product['product_name'],
            $product['description'],
            $product['type'],
            $product['availability'],
            $product['average_rating'],
            $product['images'],
        );

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        $added = $this->connection->insert_id;

        //now update product specialisation
        $type = $product['type'];
        $placeholders = "?";
        $vartypes = "";
        $column = "";

        if ($type === "Audo_Visual_Equipment") {
            $placeholders .= ",?,?";
            $vartypes .= "dsi";
            $column .= "kHz,resolution,product_id";
        } else if ($type === 'Electronic_Accessoried') {
            $placeholders .= ",?,?";
            $vartypes .= "iii";
            $column .= "product_id,accessory_type,compatibility";
        } else if ($type === "Computing_Devices") {
            $placeholders .= ",?,?,?";
            $vartypes .= "issi";
            $column .= "product_id,cpu,operating_system,storage";
        }

        $query = "INSERT INTO $type ($column) VALUES($placeholders)";
        $statement = $this->connection->prepare($query);
        $statement->bind_param($vartypes, $added);  ////fix THISSS

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        //update Sold_by
        $retailer = $product['retailer_id'];
        $price = $product['price'];

        $query = "INSERT INTO Sold_by VALUES(?,?,?)";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("iif", $retailer, $added, $price);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        //update price_history
        $query = "INSERT INTO Price_History (product_id,retailer_id,price) VALUES(?,?,?)";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("iif", $added, $retailer, $price);

        //not sure what other tables to update
        return $this->response("HTTP/1.1 200 OK", "success", "product added successfyllu", null);
    }

    //this will remove products from the tables - only manager apikeys will be valid
    private function removeProduct($apikey, $pid)
    {
        $query = "DELETE FROM studentnum_products WHERE id=?";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("i", $pid);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't remove product", null);

        return $this->response("HTTP/1.1 200 OK", "success", "product removed successfully", null);
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
    }

    //this removes the passed in product from the users wishlist
    private function removeWishlist($apikey, $pid)
    {
    }

    //this gets everything a a users wishlist
    private function getWishlist($apikey)
    {
    }

    //to change the price of an item
    private function updatePrice($apikey, $price, $retailer, $product, $date)
    {
    }
}


$API = API::instance();
$request = $_SERVER["REQUEST_METHOD"];

?>