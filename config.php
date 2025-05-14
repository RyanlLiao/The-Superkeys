<?php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

class Database {
    private static $instance = null;
    private $mysqli;

    private $host;
    private $db;
    private $user;
    private $password;

    private function __construct() {
        $dotenv = Dotenv::createImmutable(__DIR__);
        $dotenv->load();

        $this -> host = $_ENV['DB_HOST'];
        $this -> db = $_ENV['DB_NAME'];
        $this -> user = $_ENV['DB_USER'];
        $this -> password = $_ENV['DB_PASSWORD'];

        $this -> mysqli = new mysqli($this -> host, $this -> user, $this -> pass, $this -> db);

        if ($this -> mysqli -> connect_error) {
            die("Database connection failed: " . $this -> mysqli -> connect_error);
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function connect() {
        return $this -> mysqli;
    }
}
?>