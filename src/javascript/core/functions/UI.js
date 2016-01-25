define([
    'app',
    'dispatcher',
    'U',
    'C',
    'language',
    'i18n',
    'Logger',
    'jquery',
    'underscore',
    'Storage',
    'semanticui_modal',
    'API',
    'semanticui_checkbox'
], function (AppCube,Dispatcher,U,C,Language,i18n,Logger,$,_,Storage,semanticui_modal,API,semanticuiCheckbox) {
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame || function() {
            //return setTimeout(arguments[0], 1000 / 60);
            return -1;
        }
    })();

    window.cancelRequestAnimFrame = (function() {
        return window.cancelAnimationFrame
            || window.webkitCancelRequestAnimationFrame
            || window.mozCancelRequestAnimationFrame
            || window.oCancelRequestAnimationFrame
            || window.msCancelRequestAnimationFrame || function() {
            return -1;
        }
    })();

    var animation = null;
    
    return {
        showDialog: function (title, message, options) {
            options = options || {};
            options = $.extend({
                specialDialogUI: '',
                btns:{
                    negative:'common.form.cancel',
                    positive:'common.form.apply',
                    others:[]
                }
            }, options);

            var appDialog = options.el || $('#app-dialog');
            appDialog.attr('special-dialog-ui', options.specialDialogUI);
            appDialog.parent().removeClass('hidden');
            appDialog.removeClass('hidden');
            //css size
            appDialog.removeClass("small medium large x-large");

            if(options.size){
                appDialog.addClass(options.size);
            }

            //header
            var dialogHeader = appDialog.find('.header');
            dialogHeader.html(title);

            //actions
            var dialogActions = appDialog.find('.actions');
            dialogActions.html('');

            if (options.footer != false) {
                if (options.btns.negative && options.btns.negative !="") {
                    dialogActions.append('<div class="ui button negative">'+i18n.t(options.btns.negative)+'</div>');
                }
                if (options.btns.positive && options.btns.positive !="") {
                    dialogActions.append('<div class="ui button primary positive">'+i18n.t(options.btns.positive)+'</div>');
                }
                _.each(options.btns.others,function(key){
                    if(typeof key == 'string'){
                        dialogActions.append('<div class="ui primary button">'+i18n.t(key)+'</div>');
                    }else if(typeof key == 'object'){
                        var name = i18n.t(key.name);
                        var className = key.className||'';
                        var node = $('<div class="ui button">'+name+'</div>');
                        node.addClass(className);
                        if(key.icon){
                            node.prepend('<i class="icon '+key.icon+'"></i>');
                        }
                        if(key.onClick){
                            node.bind('click',function(){
                                Dispatcher.trigger('click:'+key.onClick,{},'Component');
                            });
                        }
                        dialogActions.append(node);
                    }
                });
            }

            var dialogContent = appDialog.find('.content');
            if (dialogContent.length == 0) {
                dialogHeader.after('<div class="content"></div>');
                dialogContent = appDialog.find('.content');
            }
            if (typeof message == 'string') {
                dialogContent.html(message);
            } else {
                var view = new message(_.extend({},{el: appDialog.find(".content")},options));
                appDialog.data('dialog-view', view);
                if(view.init){
                    view.init();
                }
                if(view.beforeShow){
                    view.beforeShow();
                }
                view.render(options);
                if(view.$('.ui.checkbox').length>0){
                    view.$('.ui.checkbox').checkbox();
                }
            }

            var modalOption = _.pick(options,['closable','useCss','transition','duration','easing','allowMultiple','observeChanges','onVisible','onHidden','options']);

            modalOption.transition = modalOption.transition|| 'scale';

            if(options.closable == false){
                modalOption.closable = false;
                appDialog.children('.icon.close').hide();
            }else{
                appDialog.children('.icon.close').show();
            }

            modalOption.onApprove = function(){
                if (options && options.success) {
                    options.success(appDialog.data('dialog-view'));
                }
                return false;
            };

            modalOption.onDeny = function(){
                if (options && options.error) {
                    options.error(appDialog.data('dialog-view'));
                }
            };

            modalOption.onHidden = function(){
                appDialog.removeAttr('special-dialog-ui');
                var view = appDialog.data('dialog-view');
                if(view){
                    if(view.$('.ui.checkbox').length>0){
                        view.$('.ui.checkbox').checkbox('destroy');
                    }
                    if(view.beforeHide)view.beforeHide();
                    view.destroy();
                    appDialog.data('dialog-view',null);
                }
                appDialog.removeClass('hidden');
                $(document).off("keyup.dialog");
            };
            //bind key
            var bindKey = function(){
                $(document).on("keyup.dialog", function(e) {
                    if((e.keyCode || e.which) == 13){
                        modalOption.onApprove();
                    }
                });
            };

            if(modalOption.onVisible){
                var onVisible = modalOption.onVisible;
                modalOption.onVisible = function(arguments){
                    onVisible(arguments);
                    bindKey();
                }
            }else{
                modalOption.onVisible = bindKey;
            }
            //modalOption.onVisible = function(){
            //    //allowMultiple
            //    if(options.allowMultiple && options.nextModalSelector){
            //        $(options.nextModalSelector)
            //          .modal({
            //            closable:false,
            //            allowMultiple: true
            //        });
            //    }else{

            //};

            if(!options.autofocus){
                modalOption.autofocus = false;
            }

            appDialog
            // .modal('destroy')
            .modal(modalOption)
            .modal('show');
        },
        hideDialog: function (options) {
            options = options || {};
            if(options.el){
                options.el.modal('hide').removeClass('hidden');
            }else{
                $('#app-dialog').modal('hide').removeClass('hidden');
            }
        },
        bindUploader:function(elems,preview,callback){
            elems.each(function(index,button){
                var uploader = $('<input type="file" style="display:none" />').insertAfter($(button));
                $(button).on('click',function(){
                    uploader.trigger('click');
                });
                if(preview){
                    uploader.change(function(event){
                        var reader = new FileReader();
                        var file = ($(this).get(0).files)[0]||{type:""};
                        if(U.isImage(file)){
                            reader.readAsDataURL(file);
                            reader.onloadend = function(e) {
                                $(preview).css('opacity',1);
                                $(preview).css('background-repeat','no-repeat');
                                $(preview).css("background-image", "url("+e.target.result+")");
                            }
                        }
                        if(callback)callback(event);
                    });
                }else{
                    uploader.change(function(event){
                        if(callback)callback(event);
                    });
                }
            });
        },
        removeStatus: function ($el) {
            $($el).closest('.field').removeClass('success error');
            $($el).closest('.field').children('.error-msg').remove();
        },
        toggleSuccess: function ($el) {
            this.removeStatus($el);
        },
        toggleError: function ($el, message) {
            this.removeStatus($el);
            $el.closest('.field').addClass('error');
            this._showMessage($el, message);
        },
        _showMessage: function (input, message) {
            if($(input).hasClass('logger-msg')){
                Logger.error(i18n.t(message));
            }else{
                if ($(input).siblings('.error-msg').length == 0) {
                    $(input).closest('.field').append('<span class="error-msg"><i class="warning circle icon"></i>' + i18n.t(message) + '</span>');
                } else {
                    $(input).siblings('.error-msg').text(i18n.t(message));
                }
            }
        },
        _visible: function (input) {
            return (document.body.scrollTop < input.offset().top);
        },
        createCaptcha: function (ele) {
            // if(!ele || !ele.visualCaptcha) {
            //     return
            // }

            if(!ele){
                return;
            }

            getCaptchaInfo();
            initCaptchaEvent();

            //返回可用接口
            return {
                getCaptchaValue:function(){
                    return $("#captcha").val();
                },
                getCaptchaHeaderSecret:function(){
                    return $("#captcha_img").data("HEADER_SECRET");
                },
                refresh:function(){
                    $("#captcha_img").click();
                }
            }
            /*
            *  绑定事件
            */
            function initCaptchaEvent(){
                //bind captcha event
                $("body").delegate("#captcha_img","click",function(){
                    var btn=$(this);
                    btn.attr("src","").css("background","url(images/ajax_loader_mini.gif) no-repeat center center");
                    getCaptchaInfo();
                });
            }
                
            /*
            * 获取验证码图片的信息
            * 
            */
            function getCaptchaInfo(){
                var random=Math.random();
                $.ajax({
                    url:API.get("captcha.secret"),
                    type: 'get',
                    data: { _ : random },
                    dataType:"json"
                }).done(function(data, textStatus, jqXHR){
                    var info=jqXHR.getResponseHeader('X-LAS-SECRET');
                    ele.find("#captcha_img").attr("src",API.get("captcha")+"?secret="+info).data("HEADER_SECRET",info);
                }).fail(function(){
                    ele.find("#captcha_img").attr("src","");
                    Logger.error("prelogin.error.get-captcha",{doI18n:true});
                }).always(function(){
                    ele.find(".captcha-warpper").show().end().find(".default-text").hide();
                });
            }
        },
        //upload
        initIconProgress:function(e){
            var c = $(e).get(0);
            var b = c.getContext("2d");
            b.save();
            b.fillStyle = "#000000";
            b.fillRect(0,0,174,174);
            b.restore();
        },
        startUploadIcon:function(e){
            var c = $(e).get(0);
            var b = c.getContext("2d");
            b.save();
            b.beginPath();
            b.arc(87,87,80,0,Math.PI*2);
            b.closePath();
            b.clip();
            b.clearRect(0,0,174,174);
            b.restore();
            this.progressIcon(e,0);
        },
        progressIcon:function(e,final){
            var self = this;
            var percent = $(e).data("percent")||0;
            if(animation){
                cancelRequestAnimationFrame(animation);
            }
            self.progressAnimation(e,percent,final);
        },
        progressAnimation:function(e,percent,final){
            var self = this;
            if(percent>final)percent=final;
            var c = $(e).get(0);
            var b = c.getContext("2d");
            b.save();
            //clip big circle
            b.beginPath();
            b.arc(87,87,80,0,Math.PI*2);
            b.closePath();
            b.clip();
            b.clearRect(0,0,174,174);
            b.restore();
            b.fillStyle = "#000000";
            //draw line
            b.beginPath();
            b.arc(87,87,80,0,Math.PI*2);
            b.closePath();
            b.stroke();
            //draw angle
            b.beginPath();
            if(percent==0){
                b.arc(87,87,60,0,Math.PI*2,true);
            }else{
                b.arc(87,87,60,Math.PI*1.5,Math.PI*(2*percent/100+1.5),true);
            }
            b.lineTo(87,87);
            b.closePath();
            b.fill();
            b.restore();
            $(e).data("percent",percent);
            if(percent<final){
                requestAnimationFrame(function(){
                    self.progressAnimation(e,percent+1,final);
                })
            }else if(percent==100){
                self.completeIcon(e);
            }
        },
        completeIcon:function(e){
            var self = this;
            var c = $(e).get(0);
            var b = c.getContext("2d");
            if(animation){
                cancelRequestAnimationFrame(animation);
            }
            var radius = 80;
            requestAnimationFrame(step);
            function step(){
                radius+=2;
                if(radius>130)radius=130;
                b.save();
                b.beginPath();
                b.arc(87,87,radius,0,Math.PI*2);
                b.closePath();
                b.clip();
                b.clearRect(0,0,174,174);
                b.restore();
                if(radius<130){
                    requestAnimationFrame(step);
                }else{
                    $(e).remove();
                }
            }
        },
        setIntroProps: function(propObj){
            $.each(propObj, function(selector, props){
                props = $.extend(props, {'data-selector': selector});
                $(selector).attr(props);
            });
        },
        initTooltips:function(){
            $('body').delegate('[data-sem-key]', 'mouseenter', function (e) {
                $(e.currentTarget).popup(
                    $.extend({}, C.get('UI.Popup'), {offset:-10,html: Language.i18n($(e.currentTarget).attr('data-sem-key'))})
                );
            });
        },
        initScreenNotification:function () {
            var MIN_WIDTH = 860;
            var $screenNotification = $('#screen-notification');
            $(window).bind('resize', function () {
                if ($(window).width() < MIN_WIDTH) {
                    $screenNotification.show();
                } else {
                    $screenNotification.hide();
                }
            }).trigger('resize');
        },
        bindLogout:function () {
            $('.logout').unbind('click.logout').bind('click.logout', function () {
                AppCube.User.logout();
            });
        }
    }//return done
});