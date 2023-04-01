
Sample pac file
// 3080 for CC Proxy
// 8888 for Charles proxy
function FindProxyForURL(url, host)
{
 // our local URLs from the domains below example.com don't need a proxy:
  if (isInNet(myIpAddress(), "192.168.1.0", "255.255.255.0")) return "PROXY 192.168.1.6:3080";
  // if (dnsDomainIs(host, "emc-st.com")) return "DIRECT";
  // All other requests go through port 8080 of proxy.example.com.
  // should that fail to respond, go directly to the WWW:
  else return "DIRECT";
  
}

Pac url to be configured on 
	start http pac hosting server on python
	python -m http.server --bind 192.168.1.6 8530
	
	http://192.168.1.6:8530/proxy.pac
	
	on external http server
	http://bit.ly/40oWfaa
	
push zscaler cert on device
C:\Users\njgx68\Downloads\OneDrive_2023-02-02\Zscaler Certificates	


python -m http.server --bind  10.17.205.104 8000



http://10.17.205.104:8000/proxy.pac