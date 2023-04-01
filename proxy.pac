
function FindProxyForURL(url, host)
{
 // our local URLs from the domains below example.com don't need a proxy:
  if (myIpAddress()	== "127.0.0.1")
	return "PROXY 192.168.1.6:3080";
  if (isInNet(myIpAddress(), "192.168.1.0", "255.255.255.0")) 
	return "PROXY 192.168.1.6:8888";
	
  // if (dnsDomainIs(host, "emc-st.com")) return "DIRECT";
  // All other requests go through port 8080 of proxy.example.com.
  // should that fail to respond, go directly to the WWW:
  //else return "DIRECT";
  //alert("Nitin proxy");
  //alert("Nitin proxy = " + myIpAddress());
  console.log("Nitin proxy = ");
  //dump("Nitin proxy = ");
  local_ip = myIpAddress();
  alert ('myip proxy - ' + local_ip);
  //return "PROXY 192.168.1.6:3080";
  return "DIRECT"
  
}
