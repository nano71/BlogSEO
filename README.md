参考的nginx配置
```shell
map $http_user_agent $bot {
  default 0;
  "~*Wget|bingbot|Googlebot|Googlebot-Image|Googlebot-Mobile|Googlebot-News|Googlebot-Video|Google-InspectionTool" 1;
}

server {
        listen 443 ssl;
        server_name blog.nano71.com;

        root /var/www/html/blog;
        index index.html;

        ssl_certificate   /etc/nginx/blog.nano71.com_bundle.crt;
        ssl_certificate_key /etc/nginx/blog.nano71.com.key;

        location / {
                if_modified_since off;
                etag off;

                add_header Cache-Control no-cache;

                try_files $uri /index.html;

                if ($bot) {
                        proxy_pass http://localhost:9001;
                }
        }
}
```
将文件上传到linux后，初始化
```shell
npm i
```
然后运行
```shell
./start.bash
```
