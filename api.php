<?php

header("Content-Type: application/json");

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
    }

    //this function will validate request data
    public function validate($data)
    {
        //apikey and api endpoint validation
    }

    //this function will check if the passed in paramater is an array of allowed values
    private function arrayCheck($param, $allowed)
    {
    }


    /////ALL FUNCTION FROM THIS POINT ASSUME DATA HAS BEEN VALIDATED/////
    public function typeHandler($data)
    {
        //this will call the correct handler function based on the type
    }

    //verifies that the apikey is valid
    private function checkApikey($apikey)
    {
    }

    //logs in the passed in user   
    private function login($email, $password)
    {
    }

    //adds a user to the database of registered users
    private function signup($data, $apikey)
    {
        $FirstName = $data["FirstName"];
        $LastName = $data["lastName"];
        $email = $data["emial"];
        $password = $data["password"];

        $salt = bin2hex(random_bytes(6));
        $hashed = hash("sha256", $password + $salt);

        //return a response
    }

    //this build the api response 
    private function response($type, $result, $message, $data)
    {
    }

    //this will get products from the database - only manager apikeys will be valid
    private function getProducts($apikey)
    {
    }

    //this will add products to the table - only manager apikeys will be valid
    private function addProducts($apikey /* ,product information */)
    {
    }

    //this will remove products from the tables - only manager apikeys will be valid
    private function removeProduct($apikey, $pid)
    {
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
    }

    //this updates the currency of prices for a row
    private function convert($currencyList, $row)
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



}


$API = API::instance();
$request = $_SERVER["REQUEST_METHOD"];

?>