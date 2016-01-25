define(['jquery', 'Logger', 'language'], function ($, Logger, language) {
  if(language.getCurLangCode() === 'zh'){
    window.jsI18nData = {"formValidation":{"user":{"loginid":"请输入合法的邮箱","email":"请输入合法的邮箱","username":"用户名不能少于6位","password":"密码不能少于8位","name":"请输入公司名称","phone":"请输入合法电话号码","captcha":"请输入验证码","password-confirm":"请确认您的密码","password-same":"两次输入的密码必须相同"},"contact":{"email":"请输入合法的邮箱","message":"请输入您的反馈信息"}},"aboutus":{"send-success":"谢谢您的反馈，我们已经收到您的信息，会尽快与您联系。","send-fail":"发送失败，请稍后再试。"},"updatebrowser":"为了您极致的体验，请使用IE11或其他现代浏览器。","get-captcha-error":"获取验证码失败，请稍后重试。","server-error":"服务器异常，请稍后重试。","signout-success":"注销成功"};
    window.jsI18nData.module =  {"analytics":"分析","segments":"用户群细分","clouddata":"云数据","cloudconfig":"云配置","cloudcode":"云代码","push":"推送","support":"支持","gamemaster":"管理","devcenter":"开发者中心","dashboard":"概况","marketing":"营销推广","appsettings":"设置","gamesettings":"设置","users":"用户","createapp":"创建应用程序","creategame":"创建应用程序"};
    $('.side-contact-article-en').remove();
  }else{
    window.jsI18nData = {"formValidation":{"user":{"loginid":"Please enter a valid email","email":"Please enter a valid email","username":"User name cannot less than 6","password":"Password cannot less than 8","name":"Please enter orgnization name","phone":"Please input a valid number","captcha":"Please input a valid captcha","password-confirm":"Please confirm your password","password-same":"Two passwords must be the same"},"contact":{"email":"Please enter a valid email","message":"Please enter your message"}},"aboutus":{"send-success":"Thanks for contacting us. We have received your message. Our support will get back to you as soon as possible.","send-fail":"Send fail, please try again latter."},"updatebrowser":"In order to make your experience excellent, please use IE11 or other modern browsers.","get-captcha-error":"Get captcha fail, please try later.","server-error":"Server error.","signout-success":"Sign out success"};
    window.jsI18nData.module =  {"analytics":"Analytics","segments":"Segments","clouddata":"Cloud Data","cloudconfig":"Cloud Config","cloudcode":"Cloud Code","push":"Push","support":"Support","gamemaster":"Master","devcenter":"Dev Center","dashboard":"Dashboard","marketing":"Marketing","appsettings":"Settings","gamesettings":"Settings","users":"Users","createapp":"Create App","creategame":"Create App"};
    $('.side-contact-article-zh').remove();
  }


  var Config = {
    EMAIL: {
      SENDAPI: '/2.0/mails/sendmail',
      SENDTO: ['support@leap.as'],
      DOMAIN: 'mercury-browser.com'
    }
  };

  var FormValidation = (function(){
    'use strict';

    /**
     * If invalid, add error ui to the field, otherwise remove error ui.
     */
    function renderValidateUI($field, msg, isValid){
      $('.validate_msg', $field).remove();
      $field.removeClass('field-error');

      if(!isValid){
        $field.append('<div class="validate_msg"><i class="icomoon-attention-circled"></i>'+msg+'</div>');
        $field.addClass('field-error');
      }
    }

    /**
     * Validate a form field.
     */
    function validateInput($input, rules){
      var name = $input.attr('name'), value = $.trim($input.val()), $field = $input.closest('.field'), isValid = true, inValidMsg = '';

      if($field.hasClass('rpassword')){
        //Is confirm password input.
        var passwordValue = $.trim($field.closest('form').find('.password input').val());
        var rpasswordValue = $.trim($input.val());
        if(rpasswordValue === ''){
          inValidMsg = jsI18nData.formValidation.user['password-confirm'];
          isValid = false;
        }else if(rpasswordValue !== passwordValue){
          inValidMsg = jsI18nData.formValidation.user['password-same'];
          isValid = false;
        }
      }else{
        // Normal input.
        var validation = rules[name];
        if (validation === undefined) return;
        inValidMsg = validation.msg;
        var rule = validation.rule;

        if(typeof rule === 'function'){
          isValid = rule(value);
        }else{
          isValid = rule.test(value);
        }
      }
      renderValidateUI($field, inValidMsg, isValid);
    }

    /**
     * Validate form;
     */
    function validateForm($form, rules){
      $('input, textarea', $form).each(function(i, input){
        validateInput($(input), rules);
      });

      return $('.field-error:visible', $form).length === 0 ? true : false;
    }

    /**
     * Contact form rules in about us.
     */
    var contactFormRules = {
      from: {
        rule: function(value){
          if(value.length){
            return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
          }
          return true;
        },
        msg: jsI18nData.formValidation.contact['email']
      },
      text: {
        rule: function(value){
          return value.length > 0;
        },
        msg: jsI18nData.formValidation.contact['message']
      }
    };

    return {
      contactFormRules: contactFormRules,
      validateInput: validateInput,
      validateForm: validateForm
    };

  })();

  var Contact = (function(){
    var $sideContactArticle = $('#side-contact-article');
    var $sideContactBtn = $('#side-contact-btn');

    $sideContactArticle.slideOut = function(){
      this.removeClass('visible');
    };
    $sideContactArticle.slideIn = function(){
      this.addClass('visible');
    };

    function initContactPopEvents(){
      $('.close', $sideContactArticle).bind('click', function(){
        $sideContactArticle.slideOut();
      });
    }

    function initContactBtn(){
      $sideContactBtn.bind('click', function(){
        $sideContactArticle.slideIn();
      });
      initFormOp($('form',$sideContactArticle), $('.send-msg-btn',$sideContactArticle));
      initContactPopEvents();
    }

    function initFormOp($form, $opButton){

      //阻止输入框回车默认的表单提交
      $form.delegate('input', 'keypress', function(e){
        if(e.keyCode === 13){
          return false;
        }
      });

      $form.delegate('input, textarea', 'keyup', function(){
        FormValidation.validateInput($(this), FormValidation.contactFormRules);
      });

      $opButton.bind('click', function(){
        var isFormValid = FormValidation.validateForm($form, FormValidation.contactFormRules), data = {};

        if(!isFormValid){
          return;
        }

        $($form.serializeArray()).each(function(i, field){
          data[field.name] = $.trim(field.value);
        });

        data = $.extend(data, {
          to: Config.EMAIL.SENDTO,
          domain: Config.EMAIL.DOMAIN
        });
        data.from = data.from || 'Anonymity';

        $.ajax({
          method: 'POST',
          url: Config.EMAIL.SENDAPI,
          data: JSON.stringify(data),
          contentType: 'application/json',
          dataType: 'json',
          beforeSend: function(){
            $opButton.addClass('loading');
          },
          complete: function(){
            $opButton.removeClass('loading');

            $sideContactArticle.slideOut();
          },
          success: function(){
            Logger.success(jsI18nData.aboutus['send-success']);
          },
          error: function(){
            Logger.error(jsI18nData.aboutus['send-fail']);
          }
        });

      });
    }

    return {
      initContactBtn: initContactBtn,
      initFormOp: initFormOp
    }
  })();
  Contact.initContactBtn();
});