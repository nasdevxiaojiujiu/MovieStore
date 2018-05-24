

'use strict';

var dappAddress = "n1zyMnYmRXpd915D2FFdfmLtaDF3ic2oAEN";

var InputMovie = function() {

}
InputMovie.prototype = {

    init: function() {
        var self = this;
        $("#submit").click(function() {
            self.commitMovie();
        });
    },

    commitMovie: function() {
        $("#movie_input_warning").hide().empty();
        var movie_uploadUser = $("#movie_uploadUser").val();
        var movie_name = $("#movie_name").val();
        var movie_description = $("#movie_description").val();
        var movie_showTime = $("#movie_showTime").val();
        var movie_fileType = $("#movie_fileType").val();
        var movie_fileSize = $("#movie_fileSize").val();
        var movie_downloadUrl = $("#movie_downloadUrl").val();
        var movie_downloadType = $("#movie_downloadType").val();
        var movie_image = $("#movie_image").attr("src");
        var movie_get_code = $("#movie_get_code").val();
        var warning_note = "";
        if(movie_uploadUser == "") {
            warning_note = "上传者ID不能为空";
            $("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#movie_input_warning").show();
            // 弹框
            return;
        }
        if(movie_name == "") {
            warning_note = "电影名称不能为空";
            $("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#movie_input_warning").show();
            // 弹框
            return;
        }
        if(movie_description == "") {
            warning_note = "电影简介不能为空";
            $("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#movie_input_warning").show();
            // 弹框
            return;
        }
        if(movie_fileType == "") {
            warning_note = "文件类型不能为空";
            $("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#movie_input_warning").show();
            // 弹框
            return;
        }
        if(movie_downloadUrl == "") {
            warning_note = "电影下载链接不能为空";
            $("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#movie_input_warning").show();
            // 弹框
            return;
        }
        if(movie_downloadType == "") {
            warning_note = "下载链接类型不能为空";
            $("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#movie_input_warning").show();
            // 弹框
            return;
        }
        if (movie_image == ""||movie_image == "img/blank.png") {
            warning_note = "请选择证件图片上传";
            $("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#movie_input_warning").show();
            // 弹框
            return;
        }
        else
        {
            var length = movie_image.replace(/[^\u0000-\u00ff]/g,"aaa").length;
            console.log(length);
			if (length > 112400) {
				warning_note = "证件图片太大，请选择小图片(base64编码大小需小于128K)";
				$("#movie_input_warning").html("<strong>注意: </strong>" + warning_note);
				$("#movie_input_warning").show();
				// 弹框
				return;
            }
        }
            
        // 提交
        var func = "add_movie_to_list";
        var req_arg_item = {
            "name": movie_name,
            "description": movie_description,
            "showTime": movie_showTime,
            "uploadTime": this.getNowFormatDate(),
            "fileType": movie_fileType,
            "fileSize": movie_fileSize,
            "downloadUrl": movie_downloadUrl,
            "downloadType": movie_downloadType,
            "key": movie_downloadUrl,   //movie_uploadUser+movie_name
            "imageData": movie_image,
            "movieGetCode": movie_get_code,
        };
        var req_args = [];
        req_args.push(req_arg_item);

        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : func,
                    "args" : JSON.stringify(req_args),
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
    },

    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            // e.detail contains the transferred data
            if(e.data && e.data.data && e.data.data.neb_sendTransaction) {
                // 收到返回数据
                if(e.data.data.neb_sendTransaction.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_sendTransaction.result);
                    console.log(obj);
                    if(obj.success==true){
                        window.location.href="movie.html"; 
                    }else{
                        alert(obj.message);
                    }
                } else {
                    console.log("Get Data From Constract Faield");
                }
            }
        });
    },
    getNowFormatDate: function() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        return currentdate;
    },
}

var inputMovieObj;

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
    inputMovieObj = new InputMovie();
    inputMovieObj.init();
    inputMovieObj.listenWindowMessage();
}



function initPage() {

    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#movie_input_warning").hide();

        
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    