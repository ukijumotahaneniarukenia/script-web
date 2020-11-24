自己署名証明書でssl化手順確認

作業ディレクトリに移動

CMD

```
$ cd /etc/nginx/conf.d
```


秘密鍵の作成

CMD

```
$ openssl genrsa 2048 > server.key
```

OUT
```
Generating RSA private key, 2048 bit long modulus (2 primes)
..............................................+++++
...........+++++
e is 65537 (0x010001)
```

POST

```
$ ls -lh server.key
-rw-r--r-- 1 root root 1.7K 11月 24 23:00 server.key
```

署名リクエスト（Certificate Signing Request）の作成

CMD

```
$ openssl req -new -key server.key -out server.csr
```

OUT
```
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:JA
State or Province Name (full name) [Some-State]:Kanagawa
Locality Name (eg, city) []:Kawasaki
Organization Name (eg, company) [Internet Widgits Pty Ltd]:UnkoMoriMori
Organizational Unit Name (eg, section) []:Dev
Common Name (e.g. server FQDN or YOUR name) []:just.another.unko.com
Email Address []:unko.morimori@unko.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:unko
An optional company name []:unko
```

POST

```
$ ls -lh server.csr
-rw-r--r-- 1 root root 1.2K 11月 24 23:04 server.csr
```


証明書の作成

CMD
```
$ openssl x509 -days 3650 -req -signkey server.key -in server.csr -out server.crt
```

OUT
```
Signature ok
subject=C = JA, ST = Kanagawa, L = Kawasaki, O = UnkoMoriMori, OU = Dev, CN = just.another.unko.com, emailAddress = unko.morimori@unko.com
Getting Private key
```

POST

```
$ ls -lh server.crt
-rw-r--r-- 1 root root 1.4K 11月 24 23:05 server.crt
```

秘密鍵のパーミッション変更

CMD
```
$ chmod 600 server.key
```

POST

```
$ ls -lh server.key
-rw------- 1 root root 1.7K 11月 24 23:00 server.key
```

設定ファイル

POST

```
$ cat /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
	# multi_accept on;
}

http {
  server {
      listen       443 ssl http2;
      server_name  just.another.unko.com;
      access_log  /var/log/nginx/access.log ;

      ssl_certificate /etc/nginx/conf.d/server.crt; # サーバー証明書のパス
      ssl_certificate_key /etc/nginx/conf.d/server.key; # 秘密鍵のパス

      location / {
          root   /usr/share/nginx/html;
          index  index.html index.htm;
      }
  }

	##
	# Basic Settings
	##

	sendfile on;
	tcp_nopush on;
	tcp_nodelay on;
	keepalive_timeout 65;
	types_hash_max_size 2048;
	# server_tokens off;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	##
	# SSL Settings
	##

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

	##
	# Gzip Settings
	##

	gzip on;

	# gzip_vary on;
	# gzip_proxied any;
	# gzip_comp_level 6;
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;


	##
	# Virtual Host Configs
	##

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}


#mail {
#	# See sample authentication script at:
#	# http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
#
#	# auth_http localhost/auth.php;
#	# pop3_capabilities "TOP" "USER";
#	# imap_capabilities "IMAP4rev1" "UIDPLUS";
#
#	server {
#		listen     localhost:110;
#		protocol   pop3;
#		proxy      on;
#	}
#
#	server {
#		listen     localhost:143;
#		protocol   imap;
#		proxy      on;
#	}
#}
```


文法チェック

CMD

```
$ nginx -t
```

OUT
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

サービス状態確認

CMD

```
$ systemctl status nginx.service
```

OUT

```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Fri 2020-11-20 09:29:19 JST; 4 days ago
       Docs: man:nginx(8)
   Main PID: 831 (nginx)
      Tasks: 13 (limit: 38312)
     Memory: 17.0M
     CGroup: /system.slice/nginx.service
             ├─831 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             ├─833 nginx: worker process
             ├─835 nginx: worker process
             ├─837 nginx: worker process
             ├─838 nginx: worker process
             ├─839 nginx: worker process
             ├─840 nginx: worker process
             ├─841 nginx: worker process
             ├─842 nginx: worker process
             ├─843 nginx: worker process
             ├─844 nginx: worker process
             ├─845 nginx: worker process
             └─846 nginx: worker process

11月 20 09:29:19 aine-MS-7B98 systemd[1]: Starting A high performance web server and a reverse proxy server...
11月 20 09:29:19 aine-MS-7B98 systemd[1]: Started A high performance web server and a reverse proxy server.
```

サービス再起動

CMD

```
$ systemctl restart nginx.service
```

サービス状態確認

CMD

```
$ systemctl status nginx.service
```

OUT
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2020-11-24 23:11:44 JST; 1min 6s ago
       Docs: man:nginx(8)
    Process: 473984 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 473986 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 473998 (nginx)
      Tasks: 13 (limit: 38312)
     Memory: 11.7M
     CGroup: /system.slice/nginx.service
             ├─473998 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             ├─473999 nginx: worker process
             ├─474000 nginx: worker process
             ├─474001 nginx: worker process
             ├─474002 nginx: worker process
             ├─474003 nginx: worker process
             ├─474004 nginx: worker process
             ├─474005 nginx: worker process
             ├─474006 nginx: worker process
             ├─474007 nginx: worker process
             ├─474008 nginx: worker process
             ├─474009 nginx: worker process
             └─474010 nginx: worker process

11月 24 23:11:44 aine-MS-7B98 systemd[1]: Starting A high performance web server and a reverse proxy server...
11月 24 23:11:44 aine-MS-7B98 systemd[1]: Started A high performance web server and a reverse proxy server.
```

ポート確認

CMD
```
$ lsof -i:80 -P
```

OUT
```
COMMAND    PID     USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
nginx   473998     root    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   473998     root    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   473999 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   473999 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474000 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474000 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474001 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474001 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474002 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474002 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474003 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474003 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474004 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474004 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474005 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474005 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474006 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474006 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474007 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474007 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474008 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474008 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474009 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474009 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
nginx   474010 www-data    6u  IPv4 4125247      0t0  TCP *:80 (LISTEN)
nginx   474010 www-data    8u  IPv6 4125249      0t0  TCP *:80 (LISTEN)
```

CMD

```
$ lsof -P -i:443
```

OUT

```
COMMAND      PID     USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
Viber      34073     aine   89u  IPv4 1764602      0t0  TCP aine-MS-7B98:54894->ec2-52-0-252-203.compute-1.amazonaws.com:443 (ESTABLISHED)
Discord    38568     aine   31u  IPv4 4113109      0t0  TCP aine-MS-7B98:37996->162.159.133.234:443 (ESTABLISHED)
chrome    422515     aine   23u  IPv4 4108936      0t0  TCP aine-MS-7B98:52312->lb-140-82-113-26-iad.github.com:443 (ESTABLISHED)
chrome    422515     aine   33u  IPv4 4133131      0t0  TCP aine-MS-7B98:33404->nrt20s19-in-f14.1e100.net:443 (ESTABLISHED)
chrome    422515     aine   37u  IPv4 4144417      0t0  TCP aine-MS-7B98:53768->nrt20s08-in-f14.1e100.net:443 (ESTABLISHED)
chrome    422515     aine   47u  IPv4 4134504      0t0  TCP aine-MS-7B98:34418->185.199.110.154:443 (ESTABLISHED)
chrome    422515     aine   53u  IPv4 4144418      0t0  TCP aine-MS-7B98:48036->nrt13s50-in-f3.1e100.net:443 (ESTABLISHED)
chrome    422515     aine   57u  IPv4 4143454      0t0  TCP aine-MS-7B98:48144->151.101.228.133:443 (ESTABLISHED)
chrome    422515     aine   61u  IPv4 4132747      0t0  TCP aine-MS-7B98:48164->151.101.228.133:443 (ESTABLISHED)
solargrap 449032     aine    9u  IPv4 3835763      0t0  TCP aine-MS-7B98:47842->151.101.192.70:443 (CLOSE_WAIT)
nginx     475401     root    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475402 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475403 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475404 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475405 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475406 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475407 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475408 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475409 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475410 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475411 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475412 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
nginx     475413 www-data    6u  IPv4 4148697      0t0  TCP *:443 (LISTEN)
```



ホスト名を変更

PRE
```
$ cat /etc/hosts
127.0.0.1	localhost
127.0.1.1	aine-MS-7B98

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

POST

```
$ cat /etc/hosts
127.0.0.1	localhost just.another.unko.com
127.0.1.1	aine-MS-7B98

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```


curlで確認

CMD
```
$ curl -v -k 'https://just.another.unko.com/'
```

OUT

HTTP2になった! HTTP3もそろそろか

- https://github.com/flano-yuki/http3-note


```
*   Trying 127.0.0.1:443...
* TCP_NODELAY set
* Connected to just.another.unko.com (127.0.0.1) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/certs/ca-certificates.crt
  CApath: /etc/ssl/certs
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: C=JA; ST=Kanagawa; L=Kawasaki; O=UnkoMoriMori; OU=Dev; CN=just.another.unko.com; emailAddress=unko.morimori@unko.com
*  start date: Nov 24 14:05:30 2020 GMT
*  expire date: Nov 22 14:05:30 2030 GMT
*  issuer: C=JA; ST=Kanagawa; L=Kawasaki; O=UnkoMoriMori; OU=Dev; CN=just.another.unko.com; emailAddress=unko.morimori@unko.com
*  SSL certificate verify result: self signed certificate (18), continuing anyway.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* Using Stream ID: 1 (easy handle 0x55b24b6dedb0)
> GET / HTTP/2
> Host: just.another.unko.com
> user-agent: curl/7.68.0
> accept: */*
>
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* old SSL session ID is stale, removing
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
< HTTP/2 200
< server: nginx/1.18.0 (Ubuntu)
< date: Tue, 24 Nov 2020 14:39:14 GMT
< content-type: text/html
< content-length: 612
< last-modified: Tue, 21 Apr 2020 14:09:01 GMT
< etag: "5e9efe7d-264"
< accept-ranges: bytes
<
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
* Connection #0 to host just.another.unko.com left intact
```

ブラウザ側で作成した証明書をインポートする

- https://kekaku.addisteria.com/wp/20190327053337

インポート後、ブラウザ再起動してアクセス

- https://just.another.unko.com/
