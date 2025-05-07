# IKEA Clone E-commerce API Documentation

## Models:

_User_

- username : string, unique (required)
- email : string, unique (required)
- phoneNumber : string (required, min length 8, numeric)
- password : string (required, min length 6)
- address : string (required)
- role : string (default "user")

_Product_

- name : string (required)
- description : text (required)
- price : integer (required)
- stock : integer (required)
- imgUrl : string (required)
- categoryId : integer (required)
- userId : integer (required)

_Category_

- name : string (required)

_Cart_

- userId : integer (required)
- productId : integer (required)
- quantity : integer (required, min 1)

## Relationships:

### **One-to-Many**

- A `User` has many `Products` (products created by admin users)
- A `User` has many `Carts` (items in a user's cart)
- A `Category` has many `Products` (products belonging to a category)
- A `Product` has many `Cart` items (multiple cart entries can reference the same product)

## Endpoints:

List of available endpoints:

- `POST /register`
- `POST /login`
- `POST /login/google`

And routes below need authentication:

- `GET /users/:id`
- `PUT /users/:id`
- `GET /products`
- `GET /products/:id`
- `GET /categories`
- `GET /categories/:id`
- `GET /carts`
- `POST /carts`
- `PUT /carts/:id`
- `DELETE /carts/:id`

And routes below need admin authorization:

- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

&nbsp;

## 1. POST /register

Description: Register a new user

Request:

- body:

```json
{
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "password": "string",
  "address": "string"
}
```

_Response (201 - Created)_

```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "address": "string",
  "role": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Username is required!"
}
OR
{
  "message": "Username already exists"
}
OR
{
  "message": "Email is required!"
}
OR
{
  "message": "Invalid email format"
}
OR
{
  "message": "Email already exists"
}
OR
{
  "message": "Phone number is required!"
}
OR
{
  "message": "Phone number must be at least 8 characters long"
}
OR
{
  "message": "Phone number must be a number"
}
OR
{
  "message": "Password is required!"
}
OR
{
  "message": "Password must be at least 6 characters long"
}
OR
{
  "message": "Address is required!"
}
```

&nbsp;

## 2. POST /login

Description: User login with email and password

Request:

- body:

```json
{
  "email": "string",
  "password": "string"
}
```

_Response (200 - OK)_

```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "access_token": "string",
  "role": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Email is required"
}
OR
{
  "message": "Password is required"
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid email/password"
}
```

&nbsp;

## 3. POST /login/google

Description: Login using Google authentication

Request:

- body:

```json
{
  "google_token": "string"
}
```

_Response (200 - OK)_

```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "access_token": "string",
  "role": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Google token is required"
}
```

&nbsp;

## 4. GET /users/:id

Description: Get a user's profile data

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "address": "string",
  "role": "string"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "User not found"
}
```

&nbsp;

## 5. PUT /users/:id

Description: Update a user's profile data

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "password": "string",
  "address": "string"
}
```

_Response (200 - OK)_

```json
{
  "message": "User profile updated successfully"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "User not found"
}
```

&nbsp;

## 6. GET /products

Description: Get all products (can be filtered by category)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- query (optional):

```json
{
  "search": "string",
  "page": "integer",
  "limit": "integer"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "name": "BILLY Bookcase",
    "description": "A classic bookcase with adjustable shelves",
    "price": 149000,
    "stock": 50,
    "imgUrl": "https://example.com/billy.jpg",
    "categoryId": 1,
    "userId": 1,
    "createdAt": "2025-04-29T10:00:00.000Z",
    "updatedAt": "2025-04-29T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "MALM Bed frame",
    "description": "High bed frame with 2 storage boxes",
    "price": 399000,
    "stock": 15,
    "imgUrl": "https://example.com/malm.jpg",
    "categoryId": 2,
    "userId": 1,
    "createdAt": "2025-04-29T10:05:00.000Z",
    "updatedAt": "2025-04-29T10:05:00.000Z"
  }
]
```

&nbsp;

## 7. GET /products/:id

Description: Get product details by ID

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": 1,
  "name": "BILLY Bookcase",
  "description": "A classic bookcase with adjustable shelves",
  "price": 149000,
  "stock": 50,
  "imgUrl": "https://example.com/billy.jpg",
  "categoryId": 1,
  "userId": 1,
  "createdAt": "2025-04-29T10:00:00.000Z",
  "updatedAt": "2025-04-29T10:00:00.000Z"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product with ID 1 not found"
}
```

&nbsp;

## 8. POST /products

Description: Create a new product (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
  "name": "string",
  "description": "string",
  "price": "integer",
  "stock": "integer",
  "imgUrl": "string",
  "categoryId": "integer",
  "userId": "integer"
}
```

_Response (201 - Created)_

```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "price": "integer",
  "stock": "integer",
  "imgUrl": "string",
  "categoryId": "integer",
  "userId": "integer",
  "updatedAt": "2025-04-29T10:00:00.000Z",
  "createdAt": "2025-04-29T10:00:00.000Z"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Name is required!"
}
OR
{
  "message": "Description is required!"
}
OR
{
  "message": "Price is required and must be a number!"
}
OR
{
  "message": "Stock is required and must be a number!"
}
OR
{
  "message": "Image URL is required!"
}
OR
{
  "message": "Category ID is required and must be a number!"
}
OR
{
  "message": "User ID is required and must be a number!"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "Not authorized"
}
```

&nbsp;

## 9. PUT /products/:id

Description: Update a product by ID (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "name": "string",
  "description": "string",
  "price": "integer",
  "stock": "integer",
  "imgUrl": "string",
  "categoryId": "integer",
  "userId": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Product with ID 1 successfully updated"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product with ID 1 not found"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "Not authorized"
}
```

&nbsp;

## 10. DELETE /products/:id

Description: Delete a product by ID (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Product with ID 1 successfully deleted"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product with ID 1 not found"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "Not authorized"
}
```

&nbsp;

## 11. GET /categories

Description: Get all product categories

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "name": "Furniture",
    "createdAt": "2025-04-29T10:00:00.000Z",
    "updatedAt": "2025-04-29T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Kitchen",
    "createdAt": "2025-04-29T10:05:00.000Z",
    "updatedAt": "2025-04-29T10:05:00.000Z"
  }
]
```

&nbsp;

## 12. GET /categories/:id

Description: Get category details by ID

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": 1,
  "name": "Furniture",
  "createdAt": "2025-04-29T10:00:00.000Z",
  "updatedAt": "2025-04-29T10:00:00.000Z"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Category with ID 1 not found"
}
```

&nbsp;

## 13. POST /categories

Description: Create a new category (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
  "name": "string"
}
```

_Response (201 - Created)_

```json
{
  "id": "integer",
  "name": "string",
  "updatedAt": "2025-04-29T10:00:00.000Z",
  "createdAt": "2025-04-29T10:00:00.000Z"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Category name is required"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "Not authorized"
}
```

&nbsp;

## 14. PUT /categories/:id

Description: Update a category by ID (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "name": "string"
}
```

_Response (200 - OK)_

```json
{
  "message": "Category with ID 1 has been successfully updated"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Category name is required"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Category with ID 1 not found"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "Not authorized"
}
```

&nbsp;

## 15. DELETE /categories/:id

Description: Delete a category by ID (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Category with ID 1 has been successfully deleted"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Category with ID 1 not found"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "Not authorized"
}
```

&nbsp;

## 16. POST /carts

Description: Add a product to the user's cart

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
  "productId": "integer",
  "quantity": "integer"
}
```

_Response (201 - Created)_

```json
{
  "message": "Item added to cart"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Invalid product ID"
}
OR
{
  "message": "Quantity must be greater than 0"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product not found"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Insufficient stock"
}
```

&nbsp;

## 17. GET /carts

Description: Get the user's cart with product details

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "userId": 2,
    "productId": 1,
    "quantity": 2,
    "createdAt": "2025-04-29T10:00:00.000Z",
    "updatedAt": "2025-04-29T10:00:00.000Z",
    "Product": {
      "id": 1,
      "name": "BILLY Bookcase",
      "price": 149000,
      "imgUrl": "https://example.com/billy.jpg",
      "stock": 50
    }
  },
  {
    "id": 2,
    "userId": 2,
    "productId": 3,
    "quantity": 1,
    "createdAt": "2025-04-29T10:05:00.000Z",
    "updatedAt": "2025-04-29T10:05:00.000Z",
    "Product": {
      "id": 3,
      "name": "LACK Side table",
      "price": 99000,
      "imgUrl": "https://example.com/lack.jpg",
      "stock": 30
    }
  }
]
```

&nbsp;

## 18. PUT /carts/:id

Description: Update the quantity of an item in the cart

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "productId": "integer",
  "quantity": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Cart with ID 1 successfully updated"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Invalid cart ID"
}
OR
{
  "message": "Invalid product ID"
}
OR
{
  "message": "Quantity must be greater than 0"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Cart with ID 1 not found"
}
```

&nbsp;

## 19. DELETE /carts/:id

Description: Remove an item from the cart

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Cart with ID 1 successfully deleted"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Cart with ID 1 not found"
}
```

&nbsp;

## Global Error

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

_Response (500 - Internal Server Error)_

```json
{
  "message": "Internal server error"
}
```
