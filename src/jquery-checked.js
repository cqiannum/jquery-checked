/*
 * jquery-checked
 * https://github.com/cqiannum/jquery-checked
 *
 * Copyright (c) 2013 cqian
 * Licensed under the MIT license.
 */

(function($) {
    "use strict";

    var Checked = $.checked = function(element, options) {
        
        this.element = element;
        this.$element = $(element);
        this.options = $.extend(true, {}, Checked.defaults, options);

        this.inps = {};
        var self = this;
        $.each(this.options.inputs, function(i, n) {
            self.inps[n.name] = n;
        });

        this.regulars = this.options.regulars;
        this.init();
    };

    Checked.prototype = {
        constructor: Checked,

        init: function() {
            var $self = $(this),
                self = this;

            //focus
            $("input, textarea").on("focus", function() {
                self.initContext($(this), self.inps);

                var set = $(this).data("set");
                if($(this).data("tip")) {
                    self.tipStatus("focus", $(this), set.focusMsg);
                }
            });

            //blur
            $("input, textarea").on("blur", function() {
                self.checkIn($(this));
            });

            //submit
            $("[type=submit]").on("submit", function() {
                var result = true,
                    form = $(this).parents("form");

                $.each(form.find("input, textarea"), function(i,n) {
                    self.initContext($(n), self.inps);
                    result = (self.checkIn($(n)) && result);
                });

                if(!result) {
                    e.preventDefault();
                }
            });
        },

        tipStatus: function(type, inp, msg) {
            if(msg) {
                var tip = inp.data("tip");
                tip = tip.removeClass("focus_tip right_tip error_tip ajax_checking_tip").
                      addClass(type + "_tip").
                      html(msg).css({
                        "position": "absolute",
                        "top": inp.position().top,
                        "left": inp.position().left,
                        "width": inp.outerWidth(),
                        "height": inp.outerHeight() + 0
                      }).slideDown(200);

                setTimeout(function() {
                    tip.fadeOut(400);
                }, 1500);
            }

            inp.removeClass("focus_input right_input error_input ajax_checking_input").
                addClass(type + "_input");
        },

        checkEq: function(set, inp) {
            if(set.type === "eq" && set.eqto) {
                if(inp.val() === inp.parents("form").find("[name='"+ set.eqto +"']").val()) {
                    this.tipStatus("right", inp, set.rightMsg);
                    return true;
                } else {
                    this.tipStatus("error", inp, set.errorMsg);
                    return false;
                }
            } else {
                return true;
            }
        },

        checkReg: function(set, inp) {
            if(this.regulars[set.type]) {
                var reg = this.regulars[set.type];
                if(reg[0].test(inp.val())) {
                    this.tipStatus("right", inp, set.rightMsg);
                    return true;
                } else {
                    this.tipStatus("error", inp, reg[1]);
                    return false;
                }
            } else {
                return true;
            }
        },

        ajaxCheck: function(set, inp) {
            if(set.ajax) {
                var ajax = set.ajax,
                    result = false;

                this.tipStatus("ajax_checking", inp, "loading...");
                $.ajax({
                    url: ajax.url,
                    type: "post",
                    data: inp.attr("name") + "=" + inp.val(),
                    dataType: "text",
                    timeout: 5000,
                    async: false,
                    success: function(d) {
                        if(d === 1) {
                            this.tipStatus("right", inp, ajax.successMsg);
                            result = true;
                        } else if (d === 0) {
                            this.tipStatus("error", inp, ajax.errorMsg);
                            result = false;
                        } else {
                            result = false;
                        }
                    },
                    error: function() {
                        this.tipStatus("error", inp, "internet error!!!");
                        result = false;
                    }
                });

                return result;
            } else {
                return true;
            }
        },

        checkBet: function(set, inp) {
            if(set.between) {
                //var bet = set.between;
                if(inp.val() >= set.between[0] && inp.val() <= set.between[1]) {
                    this.tipStatus("right", inp, set.rightMsg);
                    return true;
                } else {
                    this.tipStatus("error", inp, set.errorMsg);
                    return false;
                }
            } else {
                return true;
            }
        },

        initContext: function(inp, inps) {
            if(!inp.data("tip") && inp.attr("name") && inps[inp.attr("name")]) {
                var tip = $("<span class='input_tip' style='display: none;'></span>");

                inp.data("tip", tip).data("set", inps[inp.attr("name")]);
                tip.click(function() {
                    $(this).fadeOut(400);
                }).css("cursor", "pointer");

                inp.after(tip);
            }
        },

        //check input
        checkIn: function(inp) {
            if(inp.data("tip")) {
                var set = inp.data("set");

                return (this.checkReg(set, inp) && this.checkEq(set, inp) && this.checkBet(set, inp) && this.ajaxCheck(set, inp));
            } else {
                return true;
            }
        }
    };

    Checked.defaults = {
        regulars: {
            "email": [/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,"The email seems to be invalied."],
            "eng": [/^[A-Za-z]+$/,"You should input the char of English."],
            "chn": [/^[\u0391-\uFFE5]+$/,"You should input the char of Chinese."]
        },
        inputs: [],
        button: null,
        // onButtonClick: $.noop,
        // beforSubmit: $.noop
    };

    $.fn.checked = function(options) {

        if(typeof options === "string") {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, "checked");
                if(typeof api[method] === "function") {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if(!$.data(this, "checked")) {
                    $.data(this, "checked", new Checked(this, options));
                }
            });
        }
    };
  
}(jQuery));
