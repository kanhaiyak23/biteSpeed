# **Bitespeed Assignment**


<div>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">

</div>

# Installation

To get started with this project, follow these steps:

 1. Clone the repository:
   ```bash
   git clone https://github.com/kanhaiyak23/biteSpeed
```
 2. Install dependencies:
 ```bash
    npm install
```

3. To start the server locally, run the following command:
```bash
  node index.js  
```
# Hosted Project Link
```bash
https://bitespeed-0qzx.onrender.com

```
## API Endpoints

### Authentication Routes

1. **POST /identify**
   
- **Request Body:**
    
  ```json
  {
	"email": string,
	"phoneNumber": number
  }
  ```
 - **Response:**
  ```json
    {
		"contact":{
			"primaryContatctId": 
			"emails": string[], 
			"phoneNumbers": string[],
			"secondaryContactIds": number[] 
		}
	}
  ```   

  
  

