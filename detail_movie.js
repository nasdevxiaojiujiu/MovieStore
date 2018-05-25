

//'use strict';

var dappAddress = "n1uLi9KD6edLbGv31odHriHCkaGDGFqypMu";
var DetailMovie = function() {
    this.from = "";
}
DetailMovie.prototype = {

    init: function() {
        var self = this;
        var org_key = self.getPar("key");
        var key=unescape(org_key);  
        self.initMovieInfo(key);
        self.bindShangEvent();
    },
    
    initMovieInfo:function(key){
        var req_args = [];
        req_args.push(key);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_movie_by_key",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },
    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            // e.detail contains the transferred data
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
                    if (obj.type == "movie_info") {
                        self.parseMovieInfo(obj);
                    } else {
                        console.log("no need attation");
                    }
                    console.log(obj);
                } else {
                    console.log("Get Data From Constract Faield");
                }
            }
        });
    },

    parseMovieInfo: function(obj) {
        var self = this;
        $("#loading_content").hide();
        $("#main_content").show();
        if(obj.success==true){
            var movie=obj.movie;
            $("#movie_title").text(movie.name + " 详情介绍");
            $("#movie_image").attr("src", movie.imageData);
            $("#name").text(movie.name);
            $("#uploadUser").text(movie.from);
            $("#uploadTime").text(movie.uploadTime);
            $("#fileType").text(movie.fileType);
            $("#fileSize").text(movie.fileSize);
            $("#description").text(movie.description);
            $("#showTime").text(movie.showTime);
            $("#downloadType").text(movie.downloadType);
            $("#downloadUrl").text(movie.downloadUrl);
            self.from = movie.from;
            this.initShare(movie);
        }
    },
    initShare:function(obj){
        window._bd_share_config={  
            "common":{  
                "bdPopTitle":"轻松电影分享,这里居然有电影《"+obj.name+"》的"+obj.downloadType+"资源，爱电影，爱分享！",  
                "bdSnsKey":{},  
                "bdText":"这里居然有电影《"+obj.name+"》的"+obj.downloadType+"资源，爱电影，爱分享！",   
                "bdMini":"2",  
                "bdMiniList":false,  
                "bdPic":"img/logo.png", /* 此处填写要分享图片地址 */  
                "bdStyle":"0",  
                "bdSize":"16"  
                },  
            "share":{}  
        }; 
        with(document)0[  
                (getElementsByTagName('head')[0]||body).  
                appendChild(createElement('script')).  
                src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)  
        ];  
    },

    bindShangEvent: function() {
        var self = this;
        $("#shang_btn").click(function() {
            if(self.from != "") {
                window.postMessage({
                    "target": "contentscript",
                    "data":{
                        "to" : self.from,
                        "value" : "0.01",
                        "contract" : {
                            "function" : "",
                            "args" : "",
                        }
                    },
                    "method": "neb_sendTransaction"
                }, "*");
            }
        });
    },

    getPar: function(par){
        //获取当前URL
        var local_url = document.location.href; 
        //获取要取得的get参数位置
        var get = local_url.indexOf(par +"=");
        if(get == -1){
            return false;   
        }   
        //截取字符串
        var get_par = local_url.slice(par.length + get + 1);    
        //判断截取后的字符串是否还有其他get参数
        var nextPar = get_par.indexOf("&");
        if(nextPar != -1){
            get_par = get_par.slice(0, nextPar);
        }
        return get_par;
    }
     
}

var movieObj=new DetailMovie();

function checkNebpay() {
    console.log("check nebpay")
    try{
        var NebPay = require("nebpay");
    }catch(e){
        //alert ("Extension wallet is not installed, please install it first.")
        console.log("no nebpay");
        $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    movieObj = new DetailMovie();
    movieObj.listenWindowMessage();
    movieObj.init();
    
}
function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        $("#main_content").hide();
        $("#loading_content").show();
        console.log("web page loaded...");
        setTimeout(checkNebpay,1000);
    });
}

initPage();