事前準備

```
$ ruby --version
ruby 2.7.0p0 (2019-12-25 revision 647ee6f091) [x86_64-linux-gnu]


$ gem --version
3.1.2


$ sudo gem install sinatra

$ sudo gem install solargraph

$ sudo gem install rubocop

$ sudo gem install redcarpet
```

実行（外部からのアクセス許可）
```
$ ruby app.rb -o 0.0.0.0
```

実行（外部からのアクセス許可）
```
$ ruby app.rb
```

静的ファイルをサーブできるようにする

```
$ mkdir -p public

$ echo "Just Another Unko World" > ./public/main.html
```

テンプレートファイルをサーブできるようにする

```
$ mkdir views

$ touch views/main_erb.erb

$ echo '<%= Time.now %>' >views/main_erb.erb
```

マークダウンファイルをサーブできるようにする

```
$ touch views/main_md.markdown

$ echo '#もりもり' > views/main_md.markdown
```
