API NOTES

Will make use of XMLHttpRequest (POST)

RESTful API ENDPOINTS.
1. Register/Signup  

|Parameter|Required|Type  |Desc         |  
|---------|:------:|------|-------------|  
|Type     |    *   |String|Endpoint Type|  
|FirstName|    *   |String|First name of the user creating an account|  
|LastName |    *   |String|Last name of the user creating an account|  
|Email    |    *   |String|Email of the user creating an account (must be unique to ones in database)|  
|Password |    *   |String|Pasword of the user creating an account(Atleast 1 capital, lowercase, numeric character and special symbol. Must be longer than 8 characters in length)|  
    RETURN TYPE 1:  
    {  
        "status" : "success",  
        "timestamp" : "174623130525,  
        "data" : {  
            "apikey": "your_api_key"  
        }  
    } 
--- 
    RETURN TYPE 2:  
    {  
        "status" : "error",  
        "timestamp" : "174623130525,  
        "data" : $message 
    }  
---
---
---
2. Login  

|Parameter|Required|Type  |Desc         |  
|---------|:------:|------|-------------|  
|Type     |    *   |String|Endpoint Type|    
|Email    |    *   |String|Email of the user logging in(must exist in the database)|  
|Password |    *   |String|Pasword of the user logging in(must exist in the database)|  
    RETURN TYPE 1:  
    {  
        "status" : "success",  
        "timestamp" : "174623130525,  
        "data" : {  
            "apikey" : "your_api_key",  
            "fname" : "user's name"  
        }  
    } 
--- 
    RETURN TYPE 2:  
    {  
        "status" : "error",  
        "timestamp" : "174623130525,  
        "data" : $message 
    }  
---
---
---

3. Products  

|Parameter|Required|Type        |Desc         |  
|---------|:------:|------------|-------------|  
|Type     |    *   |String      |Endpoint Type|  
|apikey   |    *   |String      |Apikey of user using the site to know which personalised products to get for the user(if no apikey, use the default one for Guest and fetch popular products)|  
|return   |    *   |String/Array|The string "*" is used to return all results or an array containing the items to return|  
|order    |optional|String      |The results can be ordered by "ASC" or "DESC" for ascending or descending respectively|  
|search   |optional|JSON Object |An object where the keys are columns of the data and the values are the search terms. Multiple fields can be searched at a time.|  
|sort     |optional|String      |Can sort results|  
|limit    |optional|Int         |A number between 1 and 500 indicating how many results should be returned|  
    RETURN TYPE 1:  
    {  
        "status" : "success",  
        "timestamp" : "174623130525,  
        "data" : $products
    } 
--- 
    RETURN TYPE 2:  
    {  
        "status" : "error",  
        "timestamp" : "174623130525,  
        "data" : $message 
    }  
---
---
---
4. Prices  

|Parameter|Required|Type  |Desc         |  
|---------|:------:|------|-------------|  
|Type     |    *   |String|Endpoint Type|  
|||||  
---
---
---
5. Retailers  

|Parameter|Required|Type  |Desc         |  
|---------|:------:|------|-------------|  
|Type     |    *   |String|Endpoint Type|  
|||||  
---
---
---
6. Reviews  

|Parameter|Required|Type  |Desc         |  
|---------|:------:|------|-------------|  
|Type     |    *   |String|Endpoint Type|  
|||||  
---
---
---
7. Wishlist  

|Parameter|Required|Type  |Desc         |  
|---------|:------:|------|-------------|  
|Type     |    *   |String|Endpoint Type|  
|apikey   |    *   |String|Apikey of user using the site to know which products to display in their wishlist(if no apikey, user will not get to see their wishlist)|  
|return   |    *   |String/Array|The string "*" is used to return all results or an array containing the items to return|  
    RETURN TYPE for signed in user 1:  
    {  
        "status" : "success",  
        "timestamp" : "174623130525,  
        "data" : $products
    } 
--- 
    RETURN TYPE for signed in user 2:  
    {  
        "status" : "error",  
        "timestamp" : "174623130525,  
        "data" : $message 
    } 
--- 
    RETURN TYPE Guest:  
    {  
        "status" : "success",  
        "timestamp" : "174623130525,  
        "data" : {
            "Sign in to see your wishlist."
        }
    }

8. Admin(for dashboard etc. Not sure ab this)  

|||||  
|||||  
|||||  
|||||  