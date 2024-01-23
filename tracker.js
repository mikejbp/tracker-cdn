class Tracker {
    constructor({ initTime, trackerID }){ 
        this.initTime = initTime;
        this.endTime = 0;
        this.trackerID = trackerID;
        this.currentURL = window.location.href;
        this.dataObject = {
            userData: {
                ip: '',
                trackerID: this.trackerID,
                deviceType: this.getDeviceType(),
                os: navigator.userAgentData.platform || '',
                browser: navigator.userAgentData.brands[2].brand || ''
            },
            navigationData: { 
                url: '',
                visitTime: 0,
                time: 0,
                timeZone: this.getTimeZone()
            },
            eventsDetected: {
                pageclose: false,
                visibilitychange: false,
                videoplayed: null,
                sharebuttonclicked: null
            }
        }
        this.addPageCloseListener();
        this.addVideoPlayListener();
        this.addVisibilityChangeListener();
    };

    getDeviceType() {
        const ua = navigator.userAgent
        if(ua){
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
            if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                return "mobile";
            }
            return "desktop";
        } else {
            console.error('Unable to load user agent in the browser');
            return null;
        }
    };

    getTimeZone() {
        let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let timeZoneOffsetMinutes = new Date().getTimezoneOffset();
        
        let sign = (timeZoneOffsetMinutes > 0) ? '-' : '+';
        timeZoneOffsetMinutes = Math.abs(timeZoneOffsetMinutes);
        
        let hours = Math.floor(timeZoneOffsetMinutes / 60);
        let minutes = timeZoneOffsetMinutes % 60;

        let formattedOffset = (minutes > 0) ? `${sign}${hours}:${minutes}` : `${sign}${hours}`;

        return `${timeZone} UTC${formattedOffset}`;
    }

    sendData(){
        this.endTime = Date.now();

        this.dataObject.navigationData.visitTime = this.endTime - this.initTime;
        this.dataObject.navigationData.time = new Date();

        navigator.sendBeacon('https://d8q6mq1m-5000.use2.devtunnels.ms/api/v1/tracking', JSON.stringify(this.dataObject));
        this.initTime = Date.now();
        this.dataObject.eventsDetected.videoplayed = null;
    };

    addPageCloseListener() {
        document.body.addEventListener('click', () => {
            requestAnimationFrame(() => {
                if(this.currentURL !== window.location.href){
                    const buttons = document.getElementsByTagName('button');
                    const shareButtons = Array.from(buttons).filter(button => button.className.includes('share'));
                    if(shareButtons.length > 0) {
                        for(let i = 0; i < shareButtons.length; i++){
                            shareButtons[i].addEventListener('click', () => {
                                this.dataObject.eventsDetected.sharebuttonclicked = true;
                            })
                        }
                    }

                    this.dataObject.navigationData.url = this.currentURL;
                    this.currentURL = window.location.href;
                    this.dataObject.eventsDetected.pageclose = true;
                    this.sendData();
                    this.dataObject.eventsDetected.pageclose = false;
                    this.dataObject.eventsDetected.sharebuttonclicked = false;
                    this.addVideoPlayListener();
                }
            });
        }, true);
    };

    addVisibilityChangeListener(){
        document.addEventListener('visibilitychange', () => {
            if(document.visibilityState === 'hidden') {
                this.dataObject.navigationData.url = this.currentURL;
                this.currentURL = window.location.href;
                this.dataObject.eventsDetected.visibilitychange = true;
                this.sendData();
                this.dataObject.eventsDetected.visibilitychange = false;
            } 
            if(document.visibilityState === 'visible') this.initTime = Date.now();
        });
    };

    addVideoPlayListener(){
       const videos = document.getElementsByTagName('video');
        if(videos.length > 0) {
            for(let i = 0; i < videos.length; i++){
                videos[i].addEventListener('play', () => {
                    document.addEventListener('visibilitychange', () => {
                        if(document.visibilityState === 'hidden') {
                            videos[i].pause();
                            this.dataObject.eventsDetected.videoplayed = false;
                        } 
                    });
                    videos[i].addEventListener('timeupdate', () => {
                        try {
                            if(videos[i].currentTime >= (videos[i].duration * 0.8)) this.dataObject.eventsDetected.videoplayed = true;
                        } catch (error) {}
                    })
                })
            }
        }    
    };
}

const checkPermission = async (trackerID) => {
    try {
        const permise = await fetch('https://d8q6mq1m-5000.use2.devtunnels.ms/api/v1/whiteList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ trackerID })
        });
        return permise.status;
    } catch (error) {
        console.error('unable to get permise to track this page')
    }
}

const initTracker = (trackerID) => {
    let initTime = Date.now();
    new Tracker({ initTime, trackerID });
}

const trackerID = document.getElementById('tracker').getAttribute('trackerID');

if(await checkPermission(trackerID) === 202) initTracker(trackerID);
else console.error('permise denied');
