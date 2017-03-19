## Usage

[![Greenkeeper badge](https://badges.greenkeeper.io/e-Ray/rest-api.svg)](https://greenkeeper.io/)
1. Start with "node server.js"
2. Enter a API request to "localhost:3000/" either directly in your browser or through the command line
3. In order to work the API requires a Firebase service account with a corresponding key. The key can be generated from the Firebase console.
4. Currently the app listens for requests on port 3000. This can be changed by editing the "port" variable.
## Currently supported requests
-  "/erays.json" 
	- returns all currently existing e.Rays and their location
- "/erays/[erayid]?sensor=[sensor]
	- returns the last 100 values saved for the specified e.Ray and sensor	
### Parameters
- last
	- defines how many values of the current day shall be returned
- from & to
	- define a range of values to get (in days), if 'to' is not specified the range starts at the date specified by 'from' and ends at the current date. This parameter uses YYYY_M_D (no leading zeros; underscores can be replaced with "-")
- auth
	- authenticate with a Firebase auth token allowing access to performance and rpm sensors. This requires the user to be logged into the main application (the token can be retrieved from the "My e.Ray" page).
	