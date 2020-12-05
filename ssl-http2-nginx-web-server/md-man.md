- https://stackoverflow.com/questions/7580508/getting-chrome-to-accept-self-signed-localhost-certificate

$ cp /etc/ssl/openssl.cnf /etc/ssl/openssl.cnf.bak


秘密鍵の作成

```
$ openssl genrsa -des3 -out myCA.key 2048
Generating RSA private key, 2048 bit long modulus (2 primes)
......+++++
...........................+++++
e is 65537 (0x010001)
Enter pass phrase for myCA.key:
Verifying - Enter pass phrase for myCA.key:
```


セルフ認証局の作成

```
$ openssl req -x509 -new -nodes -key myCA.key -sha256 -days 825 -out myCA.pem
Enter pass phrase for myCA.key:
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:JP
State or Province Name (full name) [Some-State]:Kanagawa
Locality Name (eg, city) []:Kawasaki
Organization Name (eg, company) [Internet Widgits Pty Ltd]:UnkoMoriMori
Organizational Unit Name (eg, section) []:Dev
Common Name (e.g. server FQDN or YOUR name) []:www.just.another.unko.press
Email Address []:nak5@just.another.unko.press
```

自己証明書リクエストファイルの作成

```
$ NAME=just.another.unko.com

$ openssl genrsa -out $NAME.key 2048
Generating RSA private key, 2048 bit long modulus (2 primes)
.....+++++
......+++++
e is 65537 (0x010001)

$ openssl req -new -key $NAME.key -out $NAME.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:JP
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

自己証明書ファイルの作成（本来であれば、CAから受理できるファイル）

```
>$NAME.ext cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $NAME # Be sure to include the domain name here because Common Name is not so commonly honoured by itself
DNS.2 = ftp.$NAME # Optionally, add additional domains (I've added a subdomain here)
DNS.3 = mail.$NAME # Optionally, add additional domains (I've added a subdomain here)
DNS.4 = www.$NAME # Optionally, add additional domains (I've added a subdomain here)
EOF
```

外部ファイルコマンド引数に与えて作成

```
$ openssl x509 -req -in $NAME.csr -CA myCA.pem -CAkey myCA.key -CAcreateserial -out $NAME.crt -days 825 -sha256 -extfile $NAME.ext
Signature ok
subject=C = JP, ST = Kanagawa, L = Kawasaki, O = UnkoMoriMori, OU = Dev, CN = www.just.another.unko.press, emailAddress = nak5@just.another.unko.press
Getting CA Private Key
Enter pass phrase for myCA.key:
```

nginxの設定ファイルにアタッチして作成

```
$ cat ssl-http.conf
server {
    listen       443 ssl http2;
    server_name  www.just.another.unko.press;
    access_log  /var/log/nginx/access.log ;

    ssl_certificate /etc/nginx/conf.d/just.another.unko.press.crt; # CAから受理したサーバー証明書のパス
    ssl_certificate_key /etc/nginx/conf.d/just.another.unko.press.key; # 秘密鍵のパス

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
}
```

文法チェック

```
$ nginx -t
```

サービス状態確認

CMD

```
$ systemctl status nginx.service
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

ポート確認

CMD

```
lsof -P -i:443 -i:9999
```

ホスト名の修正

「www.just.another.unko.press」を追加

追加後、マシン再起動

```
$ cat /etc/hosts
127.0.0.1	localhost www.just.another.unko.press
127.0.1.1	aine-MS-7B98

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

CHROMEの場合

以下のリンク先に移動
chrome://settings/certificates

「認証局タブ」でmyCA.pemファイルを読み込み、信頼項目の全てにチェック

すでにCA証明書が存在する場合は削除して新しいものに洗い替え（本来であればアクセス時にブラウザが自動で設定する内容）

FIREFOXの場合

どうしても緑にはならんかった

BRAVE_BROWSERの場合

特になにもせず、緑になった

- https://www.just.another.unko.press


コマンドラインから実行

```
$ curl -v -k 'https://www.just.another.unko.press/'
*   Trying 127.0.0.1:443...
* TCP_NODELAY set
* Connected to www.just.another.unko.press (127.0.0.1) port 443 (#0)
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
*  subject: C=JP; ST=Kanagawa; L=Kawasaki; O=UnkoMoriMori; OU=Dev; CN=www.just.another.unko.press; emailAddress=nak5@just.another.unko.press
*  start date: Dec  5 14:41:33 2020 GMT
*  expire date: Mar 10 14:41:33 2023 GMT
*  issuer: C=JP; ST=Kanagawa; L=Kawasaki; O=UnkoMoriMori; OU=Dev; CN=www.just.another.unko.press; emailAddress=nak5@just.another.unko.press
*  SSL certificate verify result: unable to get local issuer certificate (20), continuing anyway.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* Using Stream ID: 1 (easy handle 0x55562871bdb0)
> GET / HTTP/2
> Host: www.just.another.unko.press
> user-agent: curl/7.68.0
> accept: */*
> 
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* old SSL session ID is stale, removing
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
< HTTP/2 200 
< server: nginx/1.18.0 (Ubuntu)
< date: Sat, 05 Dec 2020 14:55:40 GMT
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
* Connection #0 to host www.just.another.unko.press left intact
```
