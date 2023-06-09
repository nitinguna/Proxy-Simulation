# Proxy-Simulation
This project is collection of tools which assist simulation of proxy setup at home. 
Proxy setup consist of majorly 3 entities
- HTTP Server which Host Auto PAC file
- Proxy Server itself 
- Mobile App

## PAC File hosting Internet server
PAC file can be hosted over internet in any media hosting HTTP/HTTPS or it can be hosted locally on subnet
- Internet Hosting 
PAC file can be hosted on **Google Cloud Storage** with Public to internet permission enabled

![GCPStorage](https://user-images.githubusercontent.com/11830986/229266448-e560b0b1-e727-4a7a-8398-1606babc0adf.JPG)

![PublicHostedURL](https://user-images.githubusercontent.com/11830986/229266528-80487e07-a621-4047-98e2-ca902b2ad66b.JPG)
```
Public accessible URL can be like **https://storage.googleapis.com/emmagents/proxy.pac**
Above link can be shorten using bit.ly (http://bit.ly/40oWfaa)
```
## PAC file hosting locally 
PAC file can be hosted locally using a simple python server (requires python3)
- Step 1: Create a folder anywhere in PC (c:\ProxyPac)
- Step 2: Place a sample PAC file inside this folder (say Proxy.pac)
- Step 3 :go to cmd prompt c:\ProxyPac and execute 
> python -m http.server --bind 192.168.1.6 8530
> - Provide IP address of your local machine
> - 8530 is local port where this server listens

**Sequence Diagram for PAC Download**
```mermaid

sequenceDiagram
Pac-DL ->> 192.168.1.6-8530: http// 192.168.1.6-8530/Proxy.pac
192.168.1.6-8530 --x Pac-DL: Proxy.pac
Pac-DL ->> bit.ly: http//bit.ly/40oWfaa
bit.ly --x Pac-DL: Proxy.pac
Note right of bit.ly: Pac file will be downloaded from Google cloud storage.

```


## Proxy Server Setup
You have choice of 2 freely available Proxy server (on Windows environment) 
- CCProxy 
- Charles Proxy (limited to run only 30 minutes)

**CCProxy Setup**
CCProxy should be configured to run on **Port 3080**

![CCConfig](https://user-images.githubusercontent.com/11830986/229269663-0116db7a-f268-483a-a82d-2db90ab0dba4.png)

**Charles Proxy Setup**
Charles Proxy should be running on **Port 8888**

![CharlesSetup](https://user-images.githubusercontent.com/11830986/229269752-11c56793-f336-4ef0-920c-4168268beba5.JPG)

## Sample PAC file Configuration
``` 
function FindProxyForURL(url, host)
{
  local_ip = myIpAddress();
  alert ('myip proxy - ' + local_ip);
  
  if (myIpAddress()	== "127.0.0.1")
	return "PROXY 192.168.1.6:3080";
  if (isInNet(myIpAddress(), "192.168.1.0", "255.255.255.0")) 
	return "PROXY 192.168.1.6:8888";
 
  return "DIRECT"
}
```
**Interpretation**
> **myIpAddress()** function returns the IP address of the machine which is making a HTTP connection, in this case its mobile device

```
if (myIpAddress()=="127.0.0.1") ==> if IP adress returned is **LoopBack** then
>return "PROXY 192.168.1.6:3080"; ==> Redirect HTTP Traffic to **CC Proxy**
```
```
if (isInNet(myIpAddress(), "192.168.1.0", "255.255.255.0"))  ==> if IP adress returned is **Physical** then
>return "PROXY 192.168.1.6:8888"; ==> Redirect HTTP Traffic to **Charles Proxy**
```
```
return "DIRECT" ==> if IP is not LoopBack or not in the range of Subnet then Bypass Proxy
```
## **Sequence Diagram for Proxy Redirect**
- **myIpAddress()** behavior is different in AOSP Pac lib and Chrome Pac lib, Once Proxy PAC is applied each and every HTTP/S traffic from Device will be routed according to PAC file, basically from above example every HTTP/S request will be routed to either CCProxy or Charles Proxy according to value returned by myIpAddress()
> - AOSP Pac lib myIpAddress() always return LoopBack adress 
> - Chrome Pac lib myIpAddress() always return Physical IP of the device

```
Note: Application such as YouTube, Gmail, Maps or application based on WebView, OKHTTP etc always uses AOSP provided Pac Parser
Browser such as Chrome, Mozzilla, Firefox use their own implemenation of PAC processing and return Physical IP address when enquired by myIpAddress()
```
```mermaid

sequenceDiagram
Youtube ->> AOSP PAC Parser: https//www.youtube.com
Note right of AOSP PAC Parser: myIpAddress() returns Loopback Address
AOSP PAC Parser --x Youtube: 127.0.0.1 
Note right of Youtube: As per PAC rule traffic will be routed to CCProxy
Youtube ->> CCProxy: Connect https//www.youtube.com
Chrome ->> Chrome PAC Parser: https//www.youtube.com
Note right of Chrome PAC Parser: myIpAddress() returns Physical IP Address
Chrome PAC Parser --x Chrome: 192.168.1.8
Note right of Chrome: As per PAC rule traffic will be routed to Charles Proxy
Chrome ->> Charles Proxy:Connect https//www.youtube.com

```
## Sample App
[GitHUB](https://github.com/nitinguna/httptest)

A sample Android APP is developed to test the behavior of Application using different ways to communicate with HTTP/S. This includes
- Opening an URL via WebView
- Opening an URL via Native Connection object
- Downloading a file using Android Download manager
- Downloading a file using OKHTTP 
- Downloading a file using Native Connection object

Apart from this User can test HTTP connection using apps such as Youtube, Gmail, Maps, Chrome etc

**Conclusion**
> - All the above app and mechanism used in sample app always uses AOSP based Pac parsing library and myIpAdress() always return LoopBack address
> - Only traffic originated from Chorme uses a different Chrome Pac parser lib and this lib always return address as Interface IP address

## Trouble Shooting

**How would i know PAC file is actually Downloaded in Device when i configured PAC url while configuring WIFI SSID**

Connect device with adb 
Run “adb logcat | grep proxy”  look for PROBE_PAC 
- In case of success download of PAC: NetworkMonitor/104: PROBE_PAC http://192.168.1.6:8530/proxy.pac PAC fetch 200 response interpreted as 204 response.
- In case of failure : NetworkMonitor/185: PROBE_PAC http://192.168.1.6:8530/proxy.pac Probe failed with exception java.net.SocketTimeoutException: timeout

##

**How would i confirm whether PAC Download request is hitting the PAC server**

Monitor Local PAC hosting server:
-      When D/L hits you can see multiple D/L requests: like below  D/L request hits PAC server
-     192.168.1.6 - - [30/Mar/2023 11:06:42] "GET /proxy.pac HTTP/1.1" 200 -

##

**i had configured everything right but still PAC is not downloaded to device when its hosted Locally**

- Look for Firewall setting of your public and private network, the port you are using might be blocked, 
- add rule in firewall to allow incoming traffic on the port you mentioned for local PAC hosting server (for my case port 8000 is blocked for incoming traffic so i used port 8530)

##

**Opening any page in chrome gives a Warning and page cant be opened**

If traffic is routed through charles then you had to install CharleCA.cer certificate in your device
- adb push charlesCA.cer /sdcard
- Go to settings --> Security --> Encryption --> Install CA certificate






     
