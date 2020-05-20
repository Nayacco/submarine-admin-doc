# 文件存储

## 实现思路

1. 不要用用户上传的图片文件名做为文件名直接存储，容易产生冲突
2. 不要用连续递增的数字做文件 id，避免图片被直接遍历爬走了
3. 同一个文件夹下的文件个数不宜太多，否则读取文件的速度会变慢。Linux Ext2，测试单目录 3000 文件是个瓶颈

综上要点，这里采用 uuid 做为磁盘文件名，并截取 uuid 的前 6 位做 3 级目录，例如：`/9b/3b/94/9b3b9424-862d-40ca-ad81-9eeda9d30422`，因为 uuid 的前 6 位和时间相关，所以可以保证文件随机分散在各个目录。每个文件夹假设最多 1024 个文件，则存储容量可以达到 36^6\*1024 个文件

这里不采用 md5，如果用 md5 可能会出现重复上传，文件名相同的情况，因为使用场景并非网盘，重复率很小，所以用 uuid 重复存储即可。

用 uuid 的好处还有可以直接删除文件，不会留下无用文件，如果是 MD5 可能会有多个业务应用同一个文件，就无法删除。

## 代码实现

所有文件的增删改查操作都应通过 FileStoreService 完成，FileStoreService 主要做两件事：

1. 更新数据库总的文件信息
2. 将文件保存到磁盘

不管哪种方式，步骤 1 都是相同的，不同的是存储方式不一样，所以定义了 HandleFile 接口，用于存储、删除、下载文件，这里已经实现了`local` 和 `oss`两种存储方式，如果你有其他需求，自行实现 HandleFile 接口即可

配合`@ConditionalOnProperty`注解，就可以在配置文件中指定采用哪种存储方式：

```yml
upload:
  type: local # 切换方式
  local:
    path: D:\project\java\submarine-admin-backend\src\main\resources\public\
  oss:
    namespace: xxxx # 上传到某一个文件夹
    endpoint: xxxx
    viewEndpoint: xxxx
    accessKeyId: xxxx
    accessKeySecret: xxxx
    bucketName: xxxx
```

## 前端使用

业务表中存储的都是 file_store 表的 id，多个文件时可逗号拼接存储，所以前端最后获取到的是逗号拼接的 id，前端调用接口先获取到文件的信息，其中包含原始的文件名，url 等信息，于是前端可下载并重命名为原始文件名。

前端已经封装好了 `ImgUpload` 组件，可以非常方便的使用。路径为 `/src/components/ImgUpload`

## 进阶

如果有大文件断点续传的需求，这里推荐使用 [tus 协议](https://tus.io/)，支持大文件、分片、并发、断电续传、MD5 秒传（不要使用百度的 WebUploader）

前端：[tus-js-client](https://github.com/tus/tus-js-client) 或者 [@uppy/tus](https://github.com/transloadit/uppy), (`@uppy/tus` 其实就是 `tus-js-client` 的包装)

后端：[tus-java-server](https://github.com/tomdesair/tus-java-server)
