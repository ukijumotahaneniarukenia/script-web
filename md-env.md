WEBサーバインストール

```
$ sudo apt install -y nginx
```

プロセス起動

```
$ sudo /usr/sbin/nginx
```


ポート確認

```
$ sudo lsof -P -i:80
COMMAND  PID     USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
nginx   1074     root    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1074     root    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1075 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1075 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1076 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1076 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1077 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1077 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1078 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1078 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1079 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1079 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1080 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1080 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1081 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1081 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1082 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1082 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1083 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1083 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1084 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1084 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1085 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1085 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
nginx   1086 www-data    6u  IPv4 1501848      0t0  TCP *:80 (LISTEN)
nginx   1086 www-data    7u  IPv6 1501849      0t0  TCP *:80 (LISTEN)
```

ブラウザよりアクセス

- http://localhost/



SSL化

```
$ which openssl
/usr/bin/openssl

$ apt install -y moreutils
```

```
$ ls -lh /etc/ssl/openssl.cnf
-rw-r--r-- 1 root root 11K  5月 28 04:15 /etc/ssl/openssl.cnf

```


事前準備

- https://yokohei.com/docs/k8s-hw-tls.html
- https://qiita.com/katsunory/items/97f5a4738863776fbaf4
- https://qiita.com/ll_kuma_ll/items/13c962a6a74874af39c6

```
$ cat /etc/ssl/openssl.cnf | sed '/demoCA/s/demoCA/CA/' | sponge /etc/ssl/openssl.cnf

$ cat /etc/ssl/openssl.cnf | sed '/$ENV::HOME\/.rnd/d' | sponge /etc/ssl/openssl.cnf

$ cat /etc/ssl/openssl.cnf | sed '/HOME/s/= \./= \/etc\/pki/' | sponge /etc/ssl/openssl.cnf

```

ハッシュ方式をsha256に変更

```
$ cat /etc/ssl/openssl.cnf | sed -n '/# use public key default MD/p'
default_md	= default		# use public key default MD


$ cat /etc/ssl/openssl.cnf | sed '/# use public key default MD/s/= default/= sha256/' | sponge /etc/ssl/openssl.cnf


```

デフォルト値の設定

```
$ cat /etc/ssl/openssl.cnf | sed -n '/countryName_default/p' 
countryName_default		= AU


$ cat /etc/ssl/openssl.cnf | sed  '/countryName_default/s/= AU/= JP/' | sponge /etc/ssl/openssl.cnf


$ cat /etc/ssl/openssl.cnf | sed -n '/stateOrProvinceName_default/p' 
stateOrProvinceName_default	= Some-State

$ cat /etc/ssl/openssl.cnf | sed '/stateOrProvinceName_default/s/= Some-State/= Kanagawa/' | sponge /etc/ssl/openssl.cnf

$ cat /etc/ssl/openssl.cnf | sed '/localityNam/s/= Locality Name/= Chibimaruko/' | sponge /etc/ssl/openssl.cnf

$ cat /etc/ssl/openssl.cnf | sed -n '/0.organizationName_default/p' 
0.organizationName_default	= Internet Widgits Pty Ltd


$ cat /etc/ssl/openssl.cnf | sed '/0.organizationName_default/s/= Internet Widgits Pty Ltd/= UnkoMoriMoriMoriOugai/' | sponge /etc/ssl/openssl.cnf
error opening output file: Permission denied
```

```
$ cat /etc/ssl/openssl.cnf | sed  '/countryName_default/s/= AU/= JP/' | sponge /etc/ssl/openssl.cnf
$ cat /etc/ssl/openssl.cnf | sed '/stateOrProvinceName_default/s/= Some-State/= Kanagawa/' | sponge /etc/ssl/openssl.cnf
$ cat /etc/ssl/openssl.cnf | sed '/localityNam/s/= Locality Name/= Chibimaruko/' | sponge /etc/ssl/openssl.cnf
$ cat /etc/ssl/openssl.cnf | sed '/0.organizationName_default/s/= Internet Widgits Pty Ltd/= UnkoMoriMoriMoriOugai/' | sponge /etc/ssl/openssl.cnf

```

認証局サーバー側

検証時はこれで洗い替えてやり直せる

```
rm -rf /etc/pki/*
```

オレオレ証明局の秘密鍵作成

```
$ mkdir -p /etc/pki/CA/private
```

CMD

```
$ openssl genrsa -aes256 -out /etc/pki/CA/private/cakey.pem 2048
```


OUT

パスワードはunko

```
Generating RSA private key, 2048 bit long modulus (2 primes)
.........................+++++
.............+++++
e is 65537 (0x010001)
Enter pass phrase for /etc/pki/CA/private/cakey.pem:
Verifying - Enter pass phrase for /etc/pki/CA/private/cakey.pem:
```

証明書発行要求 CSRファイル 作成


CMD

```
$ openssl req -new -key /etc/pki/CA/private/cakey.pem -out /etc/pki/CA/cacert.csr
```

OUT

パスワードはunko
Enter pass phrase for /etc/pki/CA/private/cakey.pem:の入力以外は未入力でEnter

```
Enter pass phrase for /etc/pki/CA/private/cakey.pem:
Can't load /root/.rnd into RNG
140303342682560:error:2406F079:random number generator:RAND_load_file:Cannot open file:../crypto/rand/randfile.c:88:Filename=/root/.rnd
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [JP]:
State or Province Name (full name) [Kanagawa]:
Chibimaruko (eg, city) []:
Organization Name (eg, company) [UnkoMoriMoriMoriOugai]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:

```

オレオレ証明書発行


CMD


```
$ openssl x509 -days 3650 -in /etc/pki/CA/cacert.csr -req -signkey /etc/pki/CA/private/cakey.pem -out /etc/pki/CA/cacert.pem
```


OUT

パスワードは証明書発行要求 CSRファイル 作成に入力した際の文字列と同じ文字列を入力

```
Signature ok
subject=C = JP, ST = Kanagawa, O = UnkoMoriMoriMoriOugai
Getting Private key
Enter pass phrase for /etc/pki/CA/private/cakey.pem:
```

認証局サーバでの管理ファイルの作成

```
touch /etc/pki/CA/index.txt
echo 00 > /etc/pki/CA/serial
```


認証局クライアント側


鍵作成

tlsであることを確認

```
$ mkdir -p /etc/pki/tls/private
```

パスワードはunko

```
$ openssl genrsa -aes256 -out /etc/pki/tls/private/privkey.pem 2048
Generating RSA private key, 2048 bit long modulus (2 primes)
................................................................................................................................................................+++++
................................................................................................................................................+++++
e is 65537 (0x010001)
Enter pass phrase for /etc/pki/tls/private/privkey.pem:
Verifying - Enter pass phrase for /etc/pki/tls/private/privkey.pem:
```

発行要求CSRファイル作成

```
$ mkdir -p /etc/pki/tls/certs
```

CMD

```
$ openssl req -new -key /etc/pki/tls/private/privkey.pem -out /etc/pki/tls/certs/www-UnkoMoriMoriMoriOugai-com.csr
```

OUT

パスワードはunko
Common Name の入力にドメインを指定する
それ以外は未入力でEnter

```
Enter pass phrase for /etc/pki/tls/private/privkey.pem:
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [JP]:
State or Province Name (full name) [Kanagawa]:
Chibimaruko (eg, city) []:
Organization Name (eg, company) [UnkoMoriMoriMoriOugai]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:www.UnkoMoriMoriMoriOugai.com
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```

証明書発行



CMD

実行ディレクトリを設定ファイル/etc/ssl/openssl.cnfに記載したHOMEの場所に移動する

エラー吐くことがあるので、いいかんじにディレクトリやファイルを作成して直していく

```
$ cd /etc/pki

$ mkdir -p /etc/pki/CA/newcerts

$ touch /etc/pki/CA/index.txt.attr

$ openssl ca -in /etc/pki/tls/certs/www-UnkoMoriMoriMoriOugai-com.csr -out /etc/pki/tls/certs/www-UnkoMoriMoriMoriOugai-com.crt.pem -days 825
```

OUT

パスワードはunkoと入力

```
Using configuration from /usr/lib/ssl/openssl.cnf
Enter pass phrase for ./CA/private/cakey.pem:
Check that the request matches the signature
Signature ok
Certificate Details:
        Serial Number: 0 (0x0)
        Validity
            Not Before: Sep 13 09:45:38 2020 GMT
            Not After : Dec 17 09:45:38 2022 GMT
        Subject:
            countryName               = JP
            stateOrProvinceName       = Kanagawa
            organizationName          = UnkoMoriMoriMoriOugai
            commonName                = www.UnkoMoriMoriMoriOugai.com
        X509v3 extensions:
            X509v3 Basic Constraints: 
                CA:FALSE
            Netscape Comment: 
                OpenSSL Generated Certificate
            X509v3 Subject Key Identifier: 
                F6:36:99:9A:7C:3B:24:F9:2C:70:B2:65:D5:34:75:0D:42:ED:D3:3B
            X509v3 Authority Key Identifier: 
                DirName:/C=JP/ST=Kanagawa/O=UnkoMoriMoriMoriOugai
                serial:10:55:ED:03:72:42:FA:92:CC:BA:79:F5:D6:B8:C0:68:E0:92:12:1C

Certificate is to be certified until Dec 17 09:45:38 2022 GMT (825 days)
Sign the certificate? [y/n]:y


1 out of 1 certificate requests certified, commit? [y/n]y
Write out database with 1 new entries
Data Base Updated
```

このまま起動するとパスワード求められるので、聞かれない秘密鍵を作成

genrsaではなくrsaで作成

```
$ openssl rsa -in /etc/pki/tls/private/privkey.pem -out /etc/pki/tls/private/privkey-nopass.pem
Enter pass phrase for /etc/pki/tls/private/privkey.pem:
writing RSA key
```

ここまでで作成したファイルたちの確認

確認後、nginxの設定ファイルに反映

```
$ find /etc -type f | grep -P '.pem$'
/etc/pki/CA/cacert.pem
/etc/pki/CA/newcerts/00.pem
/etc/pki/CA/private/cakey.pem
/etc/pki/tls/certs/www-UnkoMoriMoriMoriOugai-com.crt.pem <-使う（サーバー証明書のパス）
/etc/pki/tls/private/privkey.pem
/etc/pki/tls/private/privkey-nopass.pem <-使う（秘密鍵のパス-WEBサーバープロセス起動時のパスワード入力なし）

$ find /etc -type f | grep -P '.crt$'
/etc/ssl/certs/ca-certificates.crt

$ find /etc -type f | grep -P '.csr$'
/etc/pki/CA/cacert.csr
/etc/pki/tls/certs/www-UnkoMoriMoriMoriOugai-com.csr
```



変更対象ファイル
/etc/nginx/nginx.conf

serverディレクティブをhttpディレクティブの中に追加

変更内容

```
server{
	listen 443;
	ssl on;
	server_name www.example.com;
	ssl_certificate /etc/pki/tls/certs/www-UnkoMoriMoriMoriOugai-com.crt.pem; # サーバー証明書のパス
	ssl_certificate_key /etc/pki/tls/private/privkey-nopass.pem; # 秘密鍵のパス
}
```


変更前

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

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
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

変更後

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

	server{
		listen 443;
		ssl on;
		server_name www.example.com;
		ssl_certificate /etc/pki/tls/certs/www-UnkoMoriMoriMoriOugai-com.crt.pem; # サーバー証明書のパス
		ssl_certificate_key /etc/pki/tls/private/privkey-nopass.pem; # 秘密鍵のパス
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

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
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

nginxプロセス再起動

プロセス停止

```
$ lsof -P -i:80 | awk '$0=$2'|tail -n+2|sort|uniq|xargs kill -9

$ lsof -P -i:443 | awk '$0=$2'|tail -n+2|sort|uniq|xargs kill -9
```

プロセス起動

```
$ /usr/sbin/nginx
```

プロセス確認

```
$ lsof -P -i:80
COMMAND  PID     USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
nginx   2563     root    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2563     root   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2564 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2564 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2565 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2565 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2566 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2566 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2567 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2567 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2568 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2568 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2569 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2569 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2570 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2570 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2571 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2571 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2572 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2572 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2573 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2573 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2574 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2574 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)
nginx   2575 www-data    9u  IPv4 1755095      0t0  TCP *:80 (LISTEN)
nginx   2575 www-data   10u  IPv6 1755096      0t0  TCP *:80 (LISTEN)

$ lsof -P -i:443
COMMAND  PID     USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
nginx   2563     root    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2564 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2565 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2566 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2567 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2568 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2569 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2570 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2571 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2572 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2573 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2574 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
nginx   2575 www-data    8u  IPv4 1755094      0t0  TCP *:443 (LISTEN)
```

ホスト名の変更

```
$ ls -lh /etc/hosts
-rw-r--r-- 1 root root 182  9月 13 15:39 /etc/hosts
```

変更前

```
$ cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.17.0.2	doc-ubuntu-18-04-vim
```

変更後

```
$ cat /etc/hosts
127.0.0.1	localhost www.UnkoMoriMoriMoriOugai.com
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.17.0.2	doc-ubuntu-18-04-vim
```

ブラウザよりアクセス

```
$ firefox https://www.UnkoMoriMoriMoriOugai.com
```

Advancedボタンを押下して

Acceptするとssl化できていそうだが、権限周りで行けてなさそう

ページは表示できている

