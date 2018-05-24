

'use strict';

var dappAddress = "n1uLi9KD6edLbGv31odHriHCkaGDGFqypMu";
var MovieShow = function() {

}
MovieShow.prototype = {

    init: function() {
        var self = this;
        self.initMovieList();
    },
    initMovieList:function(){
        var page={"pageSize":paginationObj.page_size,"pageNum":1};
        this.showMovieList(page);
        this.showMovieSum();
    },
    showMovieSum:function(){
        var req_args = [];
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_movie_sum",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },
    showMovieList:function(page){
        var req_args = [];
        req_args.push(page);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_movie_by_page",
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
                    if (obj.type == "movie_list") {
                        self.parseMovieInfo(obj);
                    } else if (obj.type == "movie_sum") {
                        self.parseMovieSum(obj);
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

    parseMovieInfo: function(movie_list) {
        if (movie_list.data.length == 0) {
            $("#loading_page").hide();
            $("#movie_list").hide();
            $("#movie_warning").show();
        } else {
            $("#loading_page").hide();
            $("#main_page").show();
            

            $("#movie_warning").hide();
            $("#movie_list").empty().show();
            // 显示内容
            var movies = template(document.getElementById('movie_list_t').innerHTML);
            var movies_html = movies({list: movie_list.data});
            $("#movie_list").append(movies_html);
        }

        //paginationObj.init(movie_list.sum);
        //paginationObj.showPagination();  
        
    },
    parseMovieSum: function(obj) {
        paginationObj.init(obj.sum);
        paginationObj.showPagination(); 
    },
}

var movieObj=new MovieShow();

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
    movieObj = new MovieShow();
    movieObj.listenWindowMessage();
    movieObj.init();
    
}



function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        $("#movie_warning").hide();
        $("#main_page").hide();
        $("#loading_page").show();
        console.log("web page loaded...");
        setTimeout(checkNebpay,1000);
    });
}

initPage();
  
var SHOW_NUM_PER_PAGE = 12;

var Pagination = function() {
    this.list_index = [];
    this.page_size = SHOW_NUM_PER_PAGE;
    this.showGoInput = true;
    this.showGoButton = true;
};

Pagination.prototype = {
    // 初始化
    init: function(totalNum) {
        this.list_index=[];
        for(var i = 1; i <= totalNum; i++) {
            this.list_index.push(i);
        }
    },

    // 显示分页插件
    showPagination: function() {
        var self = this;
        $('#pagination').pagination({
            dataSource: this.list_index,
            pageSize: this.page_size,
            showGoInput: true,
            showGoButton: true,
            callback: function(data, pagination) {
                var click_page_num = pagination.pageNumber;
                var list_offset = data[0];
                self.onChoosePageEvent(click_page_num, list_offset);
            }
        });
    },

    // 选择页事件
    onChoosePageEvent: function(click_page_num, list_offset) {
        console.log("click_page_num = " + click_page_num + "; list_offset=" + list_offset);
        var page={
            "pageSize":this.page_size,
            "pageNum":click_page_num
        };
        movieObj.showMovieList(page);
    },
}

var paginationObj = new Pagination();