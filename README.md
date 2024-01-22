# **User Navigation Tracker**

User Navigation Tracker is able to detect and transmits user visit data and events to a specified server endpoint.

## ¿How to install and run the Tracker?

Just execute the tracker file in head section of your html code via CDN as follows:

    <script src="https://cdn.jsdelivr.net/gh/josemavarez11/tracker-cdn/tracker.js" type="module" id="tracker" trackerID="ID4567"></script>

> [!IMPORTANT]
> Use "tracker" as id of the script element in html,  and also specify a trackerID valid in server backend.

## ¿How to Use the Tracker?

The tracker needs the share buttons you want to track to contain the keyword "share" in their className attribute. Make sure to configure them this way.

You can modify the tracker code to change the server endpoints to which the tracker ID verification requests and the sending of the obtained data will go.

## Backend Configuration

The backend server must have configured a route ready to receive a POST request. It must also be configured to parse the data to string. 
In the case of Node.js this would be:


    app.post('/endpoint/to/receive/data', express.text({ type: '*/*' }), (req, res) => {
        //make something with data
        return res.sendStatus(204)
    });

The server needs an extra path to certify the validity of the tracker id you are trying to use.

## Data Received

The data object you will get will look like this:

    {
        userData: {
            ip: "",
            trackerID: "ID4567",
            deviceType: "desktop",
            os: "Windows",
            browser: "Google Chrome"
        },
        navigationData: {
            url: "https://yourwebsite/home",
            visitTime: 2518,
            time: "2024-01-19T14:02:59.182Z",
            timeZone: "America/Caracas UTC-4"
        },
        eventsDetected: {
            pageclose: true,
            visibilitychange: false,
            videoplayed: null,
            sharebuttonclicked: null
        }
    }

Where: 

- userData:
    -  **ip**: You can add the user's ip from the server by overwriting the data object that arrives in the configured route.
    - **trackerID**: Web site identifier necessary to use the tracker. It'll be validated by the serve to work.
    - **deviceType**: Represents the type of device used by the user browsing the site.
    - **os**: Represents the operating system used by the user browsing the site.
    - **browser**: Represents the browser used by the user to acces to the site.
  
- navigationData:
    - **url**: Represents the exact url address where the user browsed for the given time.
    - **visitTime**: Represents the time the user remained on the page until the time he/she closed, switched tabs or minimized the page.
    - **time**: Exact time at which the user finished browsing the given url page.
    - **timeZone**: User time zone region and difference from UTC time.

- eventsDetected:
    - **pageclose**: True or false if user close the page and url changes.
    - **visibilitychange**: True or false if user minimized the page or switched tabs changing visibility state to hidden.
    - **videoplayed**: True or false if there is a video in the DOM and user watched 80% of the video.
    - **sharebuttonclicked**: True or false if there is a share button in the DOM and user clicked it.
