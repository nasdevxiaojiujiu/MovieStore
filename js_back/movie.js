"use strict";
//上传者ID, 电影名称,电影简介，上映时间，上传时间（录入种子时，自动生成），电影文件格式，电影文件大小，下载地址（可以是微云、网盘、磁力链等地址），
//下载地址类型（微云或者网盘或者磁力链）
var MovieItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.uploadUser = obj.uploadUser;
        this.name = obj.name;
        this.description = obj.description;
        this.showTime = obj.showTime;
        this.uploadTime = obj.uploadTime;
        this.fileType = obj.fileType;
        this.fileSize = obj.fileSize;
        this.downloadUrl=obj.downloadUrl;
        this.downloadType=obj.downloadType;
        this.key=obj.key;
        this.imageData=obj.imageData;
	} else {
	    this.uploadUser = "";
        this.name = "";
        this.description = "";
        this.showTime = "";
        this.uploadTime = "";
        this.fileType = "";
        this.fileSize = "";
        this.downloadUrl="";
        this.downloadType="";
        this.key="";
        this.imageData="";
	}
};

MovieItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var MovieSys = function() {
    // 1. 先创建GoldSunStorage对象（用于存储数据）
    var goldApi = new GoldSunStorage(null);
    // 2. 定义数据结构，该行代码作用：为ApiSample创建一个属性sample_data，该属性是一个list结构，list中存储的是SampleDataItem对象
    goldApi.defineMapProperty(this, "movie_list", {
        parse: function (text) {
            return new MovieItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    goldApi.defineProperty(this, "movie_list_size");
    // 定义一个存储string的list
    goldApi.defineMapProperty(this, "movie_list_array");


    // 3. 经过1和2步，数据结构定义完成，下面需要实现接口方法，所有的数据都存放在sample_data中
}
MovieSys.prototype = {
    // 初始化方法，在使用ApiSample之前，务必要调用一次(而且只能调用一次)，所有的初始化逻辑都放到这里
    init: function() {
        if (this.movie_list_size == null) {
            this.movie_list_size = 0;
        }
    },
    // 添加一个对象到list中的例子
    add_movie_to_list: function(text) {
        var addResult = {
            success : false,
            message : ""
        };
        var obj = text;
        var result = this.query_movie_by_key(obj.key);
        if(result.success){
            addResult.success = false;
            addResult.message = "You have added a movie!";
            return addResult;
        }else{
            obj.uploadUser =  obj.uploadUser.trim();
            obj.name = obj.name.trim();
            obj.description = obj.description.trim();
            obj.showTime = obj.showTime.trim();
            obj.uploadTime = obj.uploadTime.trim();
            obj.fileType = obj.fileType.trim();
            obj.fileSize = obj.fileSize.trim();
            obj.downloadUrl=obj.downloadUrl.trim();
            obj.downloadType=obj.downloadType.trim();
            obj.key=obj.key.trim();
            obj.imageData=obj.imageData.trim();


            if(obj.uploadUser == "" || obj.name===""|| obj.description===""||obj.showTime==="" || obj.uploadTime === "" || obj.fileType == "" || obj.fileSize == ""
                 || obj.downloadUrl == "" || obj.downloadType == ""){
                addResult.success = false;
                addResult.message = "empty uploadUser / name / description / showTime / uploadTime / fileType /fileSize / downloadUrl / downloadType";
                return addResult;
            }
            var movie = new MovieItem();
            movie.uploadUser = obj.uploadUser;
            movie.name = obj.name;
            movie.description = obj.description;
            movie.showTime = obj.showTime;
            movie.uploadTime = obj.uploadTime;
            movie.fileType = obj.fileType;
            movie.fileSize = obj.fileSize;
            movie.downloadUrl=obj.downloadUrl;
            movie.downloadType=obj.downloadType;
            movie.key=obj.key;
            movie.imageData=obj.imageData;

            var index = this.movie_list_size;
            this.movie_list_array.put(index,movie.key);
            this.movie_list.put(movie.key, movie);
            this.movie_list_size +=1;
            addResult.success = true;
            addResult.message = "You successfully added a movie!";
            return addResult;
        }
    },
    movie_list_size : function(){
        return this.movie_list_size;
    },
    // 从list中查找对象的例子
    query_movie_by_key: function(key) {
        var result = {
            success : false,
            type:"movie_info",
            movie : ""
        };
        key = key.trim();
        if ( key === "" ) {
            result.success = false;
            result.movie = "";
            return result;
        }
        var movie = this.movie_list.get(key);
        if(movie){
            result.success = true;
            result.movie = movie;
        }else{
            result.success = false;
            result.movie = "";
        }
        return result;
    },
    query_movie_by_page : function(page){
        var result = {
            success : false,
            type:"movie_list",
            data : [],
            sum : 0
        };
        var pageNum=1;
        var pageSize=10;
        if(page!=undefined&&page!=null){
            if(page.pageNum!=undefined&&page.pageNum!=null){
                pageNum=page.pageNum;
            }
            if(page.pageSize!=undefined&&page.pageSize!=null){
                pageSize=page.pageSize;
            }
        }
        var number = this.movie_list_size;
        result.sum = number;
        var key;
        var movie;
        for(var i=(pageNum-1)*pageSize;i<number&&i<(pageNum*pageSize);i++){
            key = this.movie_list_array.get(number-i-1);
            movie = this.movie_list.get(key);

            var temp = {
                key: movie.key,
                name: movie.name,
                uploadTime: movie.uploadTime,
                fileSize: movie.fileSize,
                downloadType: movie.downloadType
            };

            result.data.push(temp);
        }
        if(result.data === ""){
            result.success = false;
        }else{
            result.success = true;
        }
        return result;
    },
    query_movie_sum : function(){
        var result = {
            success : false,
            type:"movie_sum",
            sum : 0
        };
        result.sum = this.movie_list_size;
        result.success = true;
        return result;
    },
};
window.MovieSys = MovieSys;

