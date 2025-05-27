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

        $types = [
            "Register",
            "Login",
            "GetAllProducts",
            "GetProduct",
            "AddProduct",
            "GetDistinct",
            "RemoveProduct",
            "AddRetailer",
            "RemoveRetailer",
            "GetReviews",
            "AddReview",
            "RemoveReview",
            "AddComment",
            "RemoveComment",
            "GetWishlist",
            "AddWishlist",
            "RemoveWishlist",
            "UpdatePrice",
            "Count",
            "GetAllUsers",
            "DeleteUser",
            "CreateCategory", 
            "UpdateCategory", 
            "RemoveCategory"
        ];        //might add admin
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
                $user = $data["user_type"];
                $username = $data["username"];
                $phoneNum = $data["phone_number"];

                $empty = $name === "" || $surname === "" || $email === "" || $password === "" || $username === "" || $user === "" || $phoneNum === "";
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
                $this->addUser($name, $surname, $email, $password, $phoneNum, $user, $username, $apikey);
                return $this->response("HTTP/1.1 200 OK", "success", "", ['apikey' => $apikey]);

            case "Login":
                $email = $data["email"];
                $password = $data["hashed_password"];

                $empty = $email == "" || $password == "";
                if ($empty) {
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Credentials", null);
                }

                return $this->login($email, $password);

            case "GetAllProducts":
                //return
                $return = $data['return'];
                //echo $return . "\n";
                if ($return == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Post Parameter", null);

                if ($return == "*" || is_array($return))
                    return $this->response("HTTP/1.1 200 OK", "success", "", $this->getProducts($data));

                return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Post Parameter", null);

            case "AddRetailer":
                $apikey = $data['apikey'];
                $rName = $data['name'];
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                if ($rName == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Retailer Name", null);

                return $this->addRetailer($apikey, $rName);
            case "RemoveRetailer":
                $apikey = $data['apikey'];
                $rid = $data['rid'];
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                if ($rid == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Retailer ID", null);

                return $this->removeRetailer($apikey, $rid);
            case "GetReviews":
                $apikey = $data['apikey'];
                $pid = $data['pid'];
                $rating_min = $data['rating_min'] ?? null;
                $rating_max = $data['rating_max'] ?? null;
                $date_from = $data['date_from'] ?? null;
                $date_to = $data['date_to'] ?? null;

                return $this->getReviews($apikey, $pid, $rating_min, $rating_max, $date_from, $date_to);
            case "AddReview":
                $apikey = $data['apikey'];
                $pid = $data['pid'];
                $date = !empty($data['date']) ? $data['date'] : date('Y-m-d');
                $rating = $data['rating'];
                $comment = $data['comment'];

                if ($pid == "" || $date == "" || $rating == "" || $comment == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Post Parameter", null);

                return $this->addReview($apikey, $pid, $date, $rating, $comment);
            case "RemoveReview":
                $apikey = $data['apikey'];
                $rid = $data['rid'];

                if ($rid == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Post Parameter", null);

                return $this->removeReview($apikey, $rid);
            case "GetWishlist":
                $apikey = $data['apikey'];

                return $this->getWishlist($apikey);
            case "AddWishlist":
                $apikey = $data['apikey'];
                $pid = $data['pid'];

                if ($pid == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Product ID", null);

                return $this->addWishlist($apikey, $pid);
            case "RemoveWishlist":
                $apikey = $data['apikey'];
                $pid = $data['pid'];

                if ($pid == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Product ID", null);

                return $this->removeWishlist($apikey, $pid);
            case "UpdatePrice":
                $apikey = $data['apikey'];
                $price = $data['price'];
                $retailer = $data['retailer'];
                $product = $data['product'];
                $date = isset($data['date']) && !empty($data['date']) ? date('Y-m-d H:i:s', strtotime($data['date'])) : date('Y-m-d H:i:s');
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                if ($price == "" || $retailer == "" || $product == "" || $date == "")
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing Post Parameter", null);

                return $this->updatePrice($apikey, $price, $retailer, $product, $date);

            case "AddProduct":
                $apikey = $data['apikey'];
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                return $this->addProducts($data);

            case "RemoveProduct":
                $apikey = $data['apikey'];
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                return $this->removeProduct($data['product_id']);

            case "GetProduct":
                $apikey = $data['apikey'];

                if (!$this->checkApikey($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                $result = $this->getProduct($data['product_id']);
                return $this->response("HTTP/1.1 200 OK", "success", "", $result);

            case "GetDistinct":
                $apikey = $data['apikey'];

                if (!$this->checkApikey($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                if (isset($data['category'])) {
                    $category = "";
                    switch ($data['category']) {
                        case "Audio_Visual_Equipment":
                            $category = "Audio_Visual_Equipment";
                            break;

                        case "Computing_Devices":
                            $category = "Computing_Devices";
                            break;

                        case "Electronic_Accessories":
                            $category = "Electronic_Accessories";
                            break;
                        default:
                            return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Category", null);
                    }

                    $result = $this->getDistinct($category, "category");
                } else if (isset($data['distinct'])) {
                    switch ($data['distinct']) {
                        case "retailer":
                            $result = $this->getDistinct("", "retailer");
                            break;
                        default:
                            return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid parameter", null);
                    }

                }

                // $result = $this->getDistinct($data);
                return $this->response("HTTP/1.1 200 OK", "success", "", $result);

            case "Count":
                $apikey = $data['apikey'];

                if (!$this->checkApikey($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                $result = $this->count($data);
                return $this->response("HTTP/1.1 200 OK", "success", "", $result);
            case "GetAllUsers":
                $apikey = $data['apikey'];

                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "This is NOT A MANAGER ID", null);

                return $this->getAllUsers();
            case "DeleteUser":
                $apikey = $data['apikey'];
                $user_id = $data['user_id'] ?? null;

                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "This is NOT A MANAGER ID", null);

                if (empty($user_id))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Missing User ID", null);

                return $this->deleteUser($user_id);
             case "CreateCategory":
                $apikey = $data['apikey'];
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                $categoryName = $data['category_name'];
                $fields = $data['fields'] ?? [];
                $datatypes = $data['datatypes'] ?? [];
                if (empty($categoryName) || !is_string($categoryName)) {
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Category Name", null);
                }

                $query = "CREATE TABLE IF NOT EXISTS `$categoryName` (
                    `product_id` INT NOT NULL,";

                foreach ($fields as $index => $field) {
                    $datatype = isset($datatypes[$index]) ? $datatypes[$index] : 'VARCHAR(255)';
                    $query .= "`$field` $datatype, ";
                }
                
                $query .= "PRIMARY KEY (`product_id`), 
                    CONSTRAINT `fk_{$categoryName}_product` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) 
                    ON DELETE CASCADE 
                    ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

                if ($this->connection->query($query) === TRUE) {
                    return $this->response("HTTP/1.1 200 OK", "success", "", "Category created successfully");
                } else {
                    return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Error creating category: " . $this->connection->error, null);
                }
            case "UpdateCategory":
                $apikey = $data['apikey'];
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                $categoryName = $data['category_name'];
                $fields = $data['fields'] ?? [];
                $datatypes = $data['datatypes'] ?? [];
                if (empty($categoryName) || !is_string($categoryName)) {
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Category Name", null);
                }

                // Get current columns in the table
                $columns = [];
                $colQuery = "SHOW COLUMNS FROM `$categoryName`";
                $colResult = $this->connection->query($colQuery);
                if ($colResult) {
                    while ($row = $colResult->fetch_assoc()) {
                        $columns[] = $row['Field'];
                    }
                }

                $alterStatements = [];
                foreach ($fields as $index => $field) {
                    if (in_array($field, $columns)) {
                        // If field exists, drop it
                        $alterStatements[] = "DROP COLUMN `$field`";
                    } else {
                        // If field does not exist, add it
                        $datatype = isset($datatypes[$index]) ? $datatypes[$index] : 'VARCHAR(255)';
                        $alterStatements[] = "ADD COLUMN `$field` $datatype";
                    }
                }

                if (empty($alterStatements)) {
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "No valid fields to alter", null);
                }

                $query = "ALTER TABLE `$categoryName` " . implode(", ", $alterStatements);
                if ($this->connection->query($query) === TRUE) {
                    return $this->response("HTTP/1.1 200 OK", "success", "", "Category updated successfully");
                } else {
                    return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Error updating category: " . $this->connection->error, null);
                }
                break;
            case "RemoveCategory":
                $apikey = $data['apikey'];
                if (!$this->userCheck($apikey))
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Credentials", null);

                $categoryName = $data['category_name'];
                if (empty($categoryName) || !is_string($categoryName)) {
                    return $this->response("HTTP/1.1 400 Bad Request", "error", "Invalid Category Name", null);
                }

                $query = "DROP TABLE IF EXISTS `$categoryName`";
                if ($this->connection->query($query) === TRUE) {
                    return $this->response("HTTP/1.1 200 OK", "success", "", "Category removed successfully");
                } else {
                    return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Error removing category: " . $this->connection->error, null);
                }
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

    private function userCheck($apikey)
    {
        if (empty($apikey))
            return false;

        $statement = $this->connection->prepare("SELECT id FROM Person WHERE api_key = ?");
        $statement->bind_param("s", $apikey);
        $statement->execute();

        $result = $statement->get_result();
        $result = $result->fetch_assoc();

        if ($result) {
            $statement = $this->connection->prepare("SELECT manager_id FROM Manager WHERE id = ?");
            $statement->bind_param("s", $result['id']);
            $statement->execute();

            $result = ($statement->get_result())->fetch_assoc();

            if ($result)
                return true;

            return false;
        }

        return false;

    }

    /////ALL FUNCTION FROM THIS POINT ASSUME DATA HAS BEEN VALIDATED/////

    //logs in the passed in user   
    private function login($email, $password)
    {
        $query = "SELECT api_key, salt, hashed_password, username,id FROM Person WHERE email = ?";
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
        if ($result["hashed_password"] != $safe)
            return $this->response("HTTP/1.1 404 BAD REQUEST", "error", "Invalid Credentials", null);

        $usertype = ($this->userCheck($result['api_key'])) ? "Manager" : "User";

        return $this->response("HTTP/1.1 200 OK", "success", "", ['apikey' => $result['api_key'], 'username' => $result['username'], 'user_type' => $usertype, "user_id" => $result['id']]);
    }

    //adds a user to the database of registered users
    private function addUser($firstname, $lastname, $email, $password, $phoneNum, $user, $username, $apikey)
    {
        $salty = bin2hex(random_bytes(6));
        $open = $password . $salty;
        $safe = hash("sha256", $open);


        $insert = "INSERT INTO Person (first_names, last_name, email, phone_number,username, hashed_password, salt, api_key) 
                    VALUES (?,?,?,?,?,?,?,?)";
        $statement = $this->connection->prepare($insert);
        $statement->bind_param("ssssssss", $firstname, $lastname, $email, $phoneNum, $username, $safe, $salty, $apikey);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add user", null);

        $added = $this->connection->insert_id;

        if ($user === "Manager") {
            $query = "INSERT INTO Manager (id) VALUES(?)";
            $statement = $this->connection->prepare($query);
            $statement->bind_param("i", $added);
        } else if ($user === "User") {
            $query = "INSERT INTO User (id) VALUES(?)";
            $statement = $this->connection->prepare($query);
            $statement->bind_param("i", $added);
        }

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add user", null);
    }

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

    private function getWhitelist($type)
    {
        if ($type == "product") {
            $allowed = [
                "product_id",
                "product_name",
                "description",
                "Category",
                "availability",
                "average_rating",
                "images",
                "retailer",
                "price",
                "price_min",
                "price_max",
            ];
        }

        if ($type == "count") {
            $allowed = [
                "Users",
                "Products",
                "Reviews",
            ];
        }
        return $allowed;
    }

    //this will get products from the database - only manager apikeys will be valid
    private function getProducts($data)
    {
        $allowed = $this->getWhitelist("product");

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
        $query = "SELECT $select FROM getProducts $whereClause $limitClause";

        $statement = $this->connection->prepare($query);
        // var_dump($query);

        if (!empty($parameters))
            $statement->bind_param($vartypes, ...$parameters);

        $statement->execute();
        $result = $statement->get_result();
        $result = $result->fetch_all(MYSQLI_ASSOC);


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

    private function getProduct($pid)
    {
        $query = "SELECT * FROM getProducts WHERE product_id = ?";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("s", $pid);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        $result = $statement->get_result();
        $result = $result->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    //this will add products to the table - only manager apikeys will be valid
    private function addProducts($product)
    {


        $images = is_array($product['images']) ? implode(',', $product['images']) : $product['images'];
        $category = is_array($product['category']) ? implode(',', $product['category']) : $product['category'];

        $query = "INSERT INTO Product (product_name,description,availability,images,Category) VALUES(?,?,?,?,?)";
        $statement = $this->connection->prepare($query);

        // if (!$statement) {
        //     echo $this->connection->error;
        //     exit;
        // }
        $statement->bind_param(
            "ssiss",
            $product['product_name'],
            $product['description'],
            $product['availability'],
            $images,
            $category
        );

        // echo "parameters bound\n";
        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        $added = $this->connection->insert_id;

        //now update product specialisation
        $category = $product['category'][0];
        // var_dump($category);
        $placeholders = "?";
        $vartypes = "";
        $column = "";
        $values = [];

        foreach ($product['parameters'] as $key => $value) {
            $values[] = $value;
        }

        if ($category === "Audio_Visual_Equipment") {
            $placeholders .= ",?,?";
            $vartypes .= "ids,";
            $column .= "product_id,kHz,resolution";
        } else if ($category === 'Electronic_Accessoried') {
            $placeholders .= ",?,?";
            $vartypes .= "iii";
            $column .= "product_id,accessory_type,compatibility";
        } else if ($category === "Computing_Devices") {
            $placeholders .= ",?,?,?";
            $vartypes .= "issi";
            $column .= "product_id,cpu,operating_system,storage";
        }

        $query = "INSERT INTO $category ($column) VALUES($placeholders)";
        $statement = $this->connection->prepare($query);

        if ($category === 'Audio_Visual_Equipment' || $category === 'Electronic_Accessoried')
            $statement->bind_param($vartypes, $added, $values[0], $values[1]);
        else if ($category === "Computing_Devices")
            $statement->bind_param($vartypes, $added, $values[0], $values[1], $values[2]);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        //update Sold_by
        $retailer = $product['retailer_id'];
        $price = $product['price'];
        $url = $product['url'];

        $query = "INSERT INTO Sold_by (retailer_id,product_id,price,url) VALUES(?,?,?,?)";
        $statement = $this->connection->prepare($query);

        $statement->bind_param("iids", $retailer, $added, $price, $url);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);

        //update price_history
        $query = "INSERT INTO Price_History (product_id,retailer_id,price) VALUES(?,?,?)";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("iid", $added, $retailer, $price);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't add product", null);


        //not sure what other tables to update
        return $this->response("HTTP/1.1 200 OK", "success", "product added successfylluy", null);
    }

    //this will remove products from the tables - only manager apikeys will be valid
    private function removeProduct($pid)
    {
        $query = "DELETE FROM Product WHERE product_id=?";
        $statement = $this->connection->prepare($query);
        $statement->bind_param("i", $pid);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't remove product", null);

        return $this->response("HTTP/1.1 200 OK", "success", "product removed successfully", null);
    }

    private function getDistinct($value, $type)
    {
        if ($type == "category") {
            $query = "SELECT DISTINCT Category FROM Product WHERE Category LIKE '%$value%'";
        } else if ($type == 'retailer') {
            $query = "SELECT DISTINCT name FROM Retailer";
        }

        // var_dump($query);
        $statement = $this->connection->prepare($query);

        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't remove product", null);

        $result = $statement->get_result();
        $result = $result->fetch_all(MYSQLI_ASSOC);

        return $result;
    }

    private function count($data)
    {
        // echo "COUNTING...";
        $type = $data['count_type'];
        $allowed = $this->getWhitelist($type);
        //var_dump($allowed);

        $type = array_intersect($allowed, [$data["count"]]);
        // var_dump($type);
        if (empty($type))
            return $this->response("HTTP/1.1 404 Not Found", "error", "Invalid Count Type", null);

        $table = "";

        switch ($type[0]) {
            case "Users":
                $table = "Person";
                break;

            case "Products":
                $table = "Product";
                break;
            case "Reviews":
                $table = "Review";
                break;
        }
        ;

        $query = "SELECT Count(*) as count FROM $table";
        $statement = $this->connection->prepare($query);
        // var_dump($query);
        if (!$statement->execute())
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Error: {$statement->error}", null);

        $result = $statement->get_result();
        $result = $result->fetch_assoc();

        // var_dump($result);
        return $result["count"];
    }
    //this adds a new retailer - only manager apikeys will be accepted
    private function addRetailer($apikey, $rName)
    {
        $query = "SELECT id FROM Person WHERE api_key = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $apikey);
        $pstmt->execute();
        $pstmt->store_result();

        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }

        $pstmt->bind_result($managerID);
        $pstmt->fetch();
        $pstmt->close();

        $query = "SELECT id FROM Manager WHERE id = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("i", $managerID);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 401 Unauthorised", "error", "This is NOT A Manager ID", null);
        }
        $pstmt->close();

        $query = "INSERT INTO Retailer (name) VALUES (?)";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $rName);
        if (!$pstmt->execute()) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", "Retailer added successfully");
    }

    //this removes a retailer from the table - only manager apikeys will be accepted
    private function removeRetailer($apikey, $rid)
    {
        $query = "SELECT id FROM Person WHERE api_key = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $apikey);
        $pstmt->execute();
        $pstmt->store_result();

        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }

        $pstmt->bind_result($managerID);
        $pstmt->fetch();
        $pstmt->close();

        $query = "SELECT id FROM Manager WHERE id = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("i", $managerID);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 401 Unauthorised", "error", "This is NOT A Manager ID", null);
        }
        $pstmt->close();

        $query = "DELETE FROM Retailer WHERE retailer_id = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("i", $rid);
        if (!$pstmt->execute()) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", "Retailer removed successfully");
    }

    private function getReviews($apikey, $pid = null, $rating_min = null, $rating_max = null, $date_from = null, $date_to = null)
    {
        if (!$this->checkApikey($apikey)) {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }

        // Join Review with Person to get username
        $query = "SELECT Review.*, Person.username 
            FROM Review 
            JOIN Person ON Review.user_id = Person.id 
            WHERE 1=1";
        $params = [];
        $types = "";

        if ($pid !== null && $pid !== "") {
            $query .= " AND product_id = ?";
            $params[] = $pid;
            $types .= "i";
        }
        if ($rating_min !== null && $rating_min !== "") {
            $query .= " AND rating >= ?";
            $params[] = $rating_min;
            $types .= "d";
        }
        if ($rating_max !== null && $rating_max !== "") {
            $query .= " AND rating <= ?";
            $params[] = $rating_max;
            $types .= "d";
        }
        if ($date_from !== null && $date_from !== "") {
            $query .= " AND date >= ?";
            $params[] = $date_from;
            $types .= "s";
        }
        if ($date_to !== null && $date_to !== "") {
            $query .= " AND date <= ?";
            $params[] = $date_to;
            $types .= "s";
        }

        $stmt = $this->connection->prepare($query);
        if (!$stmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        $stmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", $reviews);
    }

    //this will add a users review for a product from a specific retailer
    //it takes in an associative array {productID: retailer};
    private function addReview($apikey, $pid, $date, $rating, $comment)
    {
        $query = "SELECT id FROM Person WHERE api_key = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $apikey);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows > 0) {
            $pstmt->bind_result($userID);
            $pstmt->fetch();
        } else {
            $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }
        $pstmt->close();
        //check if product id exists
        $query = 'SELECT product_id FROM Product WHERE product_id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('i', $pid);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows == 0) {
            $this->response("HTTP/1.1 404 NOT FOUND", "error", "Product does not exist", null);
        }
        $pstmt->close();

        $query = 'INSERT INTO Review (product_id, user_id, date, rating, comments) VALUES (?, ?, ?, ?, ?)';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('iisss', $pid, $userID, $date, $rating, $comment);
        $pstmt->execute();
        if ($pstmt->affected_rows == 0) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->close();
        return $this->response("HTTP/1.1 200 OK", "success", "", "Review added successfully");
    }

    private function removeReview($apikey, $reviewID)
    {
        if ($this->checkApikey($apikey) == false)
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);

        $query = 'DELETE FROM Review WHERE review_id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('i', $reviewID);
        $pstmt->execute();
        if ($pstmt->affected_rows == 0) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", "Review removed successfully");
    }

    //this adds the passed in product to the users wishlist
    private function addWishlist($apikey, $pid)
    {
        $query = "SELECT id FROM Person WHERE api_key = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $apikey);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows > 0) {
            $pstmt->bind_result($userID);
            $pstmt->fetch();
        } else {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }
        $pstmt->close();

        //check if product id exists
        $query = 'SELECT product_id FROM Product WHERE product_id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('i', $pid);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Product does not exist", null);
        }
        $pstmt->close();

        //check if product is already in wishlist
        $query = 'SELECT * FROM Wishlist WHERE user_id = ? AND product_id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('ii', $userID, $pid);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows > 0) {
            return $this->response("HTTP/1.1 400 BAD REQUEST", "error", "Product already in wishlist", null);
        }
        $pstmt->close();

        $query = 'INSERT INTO Wishlist (user_id, product_id) VALUES (?, ?)';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }

        $pstmt->bind_param('ii', $userID, $pid);
        if (!$pstmt->execute()) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->close();
        return $this->response("HTTP/1.1 200 OK", "success", "", "Product added to wishlist");
    }

    //this removes the passed in product from the users wishlist
    private function removeWishlist($apikey, $pid)
    {
        $query = "SELECT id FROM Person WHERE api_key = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $apikey);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows > 0) {
            $pstmt->bind_result($userID);
            $pstmt->fetch();
        } else {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }
        $pstmt->close();

        $query = 'SELECT * FROM Wishlist WHERE user_id = ? AND product_id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('ii', $userID, $pid);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Product not in wishlist", null);
        }
        $pstmt->close();

        $query = 'DELETE FROM Wishlist WHERE user_id = ? AND product_id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('ii', $userID, $pid);
        if (!$pstmt->execute()) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->close();
        return $this->response("HTTP/1.1 200 OK", "success", "", "Product removed from wishlist");
    }

    //this gets everything a a users wishlist
    private function getWishlist($apikey)
    {
        $query = "SELECT id FROM Person WHERE api_key = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $apikey);
        $pstmt->execute();
        $pstmt->store_result();

        if ($pstmt->num_rows === 0) {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }
        $pstmt->bind_result($userID);
        $pstmt->fetch();
        $pstmt->close();

        $query = 'SELECT id FROM User WHERE id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }
        $pstmt->bind_param('i', $userID);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows === 0) {
            return $this->response("HTTP/1.1 401 Unauthorised", "error", "This is NOT A User ID", null);
        }
        $pstmt->close();

        $query = 'SELECT * FROM UserWishlist WHERE user_id = ?';
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        }

        $pstmt->bind_param('i', $userID);
        $pstmt->execute();
        $result = $pstmt->get_result();

        $wishlist = [];
        while ($row = $result->fetch_assoc()) {
            $wishlist[] = $row;
        }
        $pstmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", $wishlist);
    }

    //to change the price of an item
    private function updatePrice($apikey, $price, $retailer, $product, $date)
    {
        //manager apikey to change price
        $query = "SELECT id FROM Person WHERE api_key = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("s", $apikey);
        $pstmt->execute();
        $pstmt->store_result();

        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "Invalid API key", null);
        }

        $pstmt->bind_result($managerID);
        $pstmt->fetch();
        $pstmt->close();

        $query = "SELECT id FROM Manager WHERE id = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("i", $managerID);
        $pstmt->execute();
        $pstmt->store_result();
        if ($pstmt->num_rows == 0) {
            return $this->response("HTTP/1.1 401 Unauthorised", "error", "This is NOT A Manager ID", null);
        }
        $pstmt->close();

        // Get the current price from Sold_by
        $query = "SELECT price FROM Sold_by WHERE retailer_id = ? AND product_id = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("ii", $retailer, $product);
        $pstmt->execute();
        $pstmt->bind_result($old_price);
        if (!$pstmt->fetch()) {
            $pstmt->close();
            return $this->response("HTTP/1.1 404 NOT FOUND", "error", "No such product/retailer combination", null);
        }
        $pstmt->close();

        // Insert the old price into Price_History
        $query = "INSERT INTO Price_History (product_id, retailer_id, timestamp, price) VALUES (?, ?, ?, ?)";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("iisd", $product, $retailer, $date, $old_price);
        $pstmt->execute();
        if ($pstmt->affected_rows == 0) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't update price", null);
        }
        $pstmt->close();

        // Update the Sold_by table with the new price
        $query = "UPDATE Sold_by SET price = ? WHERE retailer_id = ? AND product_id = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);
        $pstmt->bind_param("dii", $price, $retailer, $product);
        if (!$pstmt->execute()) {
            $pstmt->close();
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't update price", null);
        }
        $pstmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", "Price updated successfully");
    }

    private function getAllUsers()
    {
        $query = "SELECT Person.* FROM Person JOIN User ON Person.id = User.id";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't prepare statement", null);
        }

        if (!$pstmt->execute()) {
            $pstmt->close();
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't retrieve users", null);
        }

        $result = $pstmt->get_result();
        $users = $result->fetch_all(MYSQLI_ASSOC);
        $pstmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", $users);
    }

    private function deleteUser($userID)
    {
        $query = "DELETE FROM Person WHERE id = ?";
        $pstmt = $this->connection->prepare($query);
        if (!$pstmt)
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Database error", null);

        $pstmt->bind_param("i", $userID);
        if (!$pstmt->execute()) {
            return $this->response("HTTP/1.1 500 Internal Server Error", "error", "Couldn't delete user", null);
        }
        $pstmt->close();

        return $this->response("HTTP/1.1 200 OK", "success", "", "User deleted successfully");
    }
}


$API = API::instance();
$request = $_SERVER["REQUEST_METHOD"];
$requestBody = file_get_contents('php://input');
$object = json_decode($requestBody, true);

$result = $API->request($object, $request);
if ($result !== true) {
    echo $result;
    exit;
}

echo $API->validate($object);

?>