
var QView = function () {

    this.ancUtils = new AncUtils();

};


QView.prototype = {
    DisplayScore: function (questionScore, overallScore) {
        $('#question-score').html(questionScore + '%');

        if (overallScore != undefined)
            $('#perc-correct').html(overallScore + '%');
    },
    GetAnswer: function () {
        return $('#answer-box').val();
    },
    DisplayCorrectAnswer: function (answer) {
        $('#correct-answer').html(answer);
    },

    switchtab: function (tabidx, tab1) {


        var panels = new Panels();

        if (tabidx == 0) {

            panels.masterShowTab(1);

            $("#answer-block").removeClass("hidePanel").addClass("displayPanel");
            $("#score-nav").removeClass("hidePanel").addClass("displayPanel");
            $("#question-nav").removeClass("hidePanel").addClass("displayPanel");
            $("#test-sel").addClass("hidePanel").removeClass("displayPanel");

            tab1();



        }

        if (tabidx == 1) {


            panels.masterShowTab(2);

            $("#answer-block").removeClass("hidePanel").addClass("displayPanel");
            $("#score-nav").addClass("hidePanel").removeClass("displayPanel");
            $("#question-nav").addClass("hidePanel").removeClass("displayPanel");
            $("#test-sel").removeClass("hidePanel").addClass("displayPanel");



            tab1();
            //   this.listtests(); test-sel

        }

        if (tabidx == 2) {


            panels.masterShowTab(3);

            $("#answer-block").removeClass("hidePanel").addClass("displayPanel");
            $("#score-nav").addClass("hidePanel").removeClass("displayPanel");
            $("#question-nav").addClass("hidePanel").removeClass("displayPanel");
            $("#test-sel").addClass("displayPanel").removeClass("hidePanel");


            tab1();
            //   this.listtests();

        }

    },
    createCatList: function (catList, processSelectFunc, context) {

        var cats = '';
        var selectEvents = [];
        var idx = 0;
        while (idx < catList.length) {
            if (catList[idx] !== undefined) {
                cats += '<a id= "s' + idx + '" href="index.html" data-role="button" data-theme="b" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-up-b"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">' + catList[idx] + '</span></span></a>';

                selectEvents.push({ key: 's' + idx, value: catList[idx] });
            }
            idx++;
        }
        

         $('#categories').html(cats);       

        this.ancUtils.addlinks(selectEvents, processSelectFunc, context);


    },


    createCSVList: function (catList, processSelectFunc, context) {

        var cats = '';
        var selectEvents = [];
        var idx = 0;
        while (idx < catList.length) {
            if (catList[idx] !== undefined) {
                cats += '<a id= "s' + idx + '" href="index.html" data-role="button" data-theme="b" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-up-b"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">' + catList[idx] + '</span></span></a>';

                selectEvents.push({ key: 's' + idx, value: catList[idx] });
            }
            idx++;
        }
        this.ancUtils.addlinks(selectEvents, processSelectFunc, context);

        $('#csv-list').html(cats);
    },

    updateBoxs: function (currentQuestionState, answer, content, answerBox) {


        // answer = this.questionset[this.currentQuestionIdx].answer.length


        //this.questionscore = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length));

        //currentQuestionState

        var answersofar = '<\BR>' + 'Progress so far: ' + '<\BR>' + answer.length + '<\BR>';

        var idx = 0;
        while (idx < currentQuestionState.length) {

            answersofar += currentQuestionState[idx] + ' ';

            idx++;
        }




        $('#answer-box').val(answerBox);

        $('#mainbody').html(content); //question box


        $('#answer-so-far').html(answersofar);
    },
    displayStandardQuestion: function (question, answer) {

        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");

        $("#answer").removeClass("hidePanel").addClass("displayPanel");

        $('#answer-box').val(answer);

        $('#mainbody').html(question);
    },
    displayMultipleChoice: function (question, constAnswers, selectionIdx) {

        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
        $("#answer").removeClass("displayPanel").addClass("hidePanel");

        //need to check if we have an answer saved for this question 
        //which should be stored in the form of an index
        //we can do a simple comparison against that.
        var idx = 2;
        var content = '<div id="rqs"><fieldset id = "t1" data-role="controlgroup"><legend>' + question + '</legend>';
        while (idx <= constAnswers.length) {
            var chkid = 'radio-choice-' + idx;
            if (idx == selectionIdx)
                content += '<input type="radio" name="radio-choice" id="' + chkid + '" value="' + (idx - 1) + '" checked="checked" /><label for="' + chkid + '">' + constAnswers[idx - 1] + '</label>';
            else
                content += '<input type="radio" name="radio-choice" id="' + chkid + '" value="' + (idx - 1) + '" /><label for="' + chkid + '">' + constAnswers[idx - 1] + '</label>';
            idx++;
        }
        content += '</fieldset></div>';

        $('#mainbody').html(content);
    },
    displayImageQuestion: function (question, answerSet) {

        $('#answer-box').val(answerSet);
        $("#imgPanel").removeClass("hidePanel").addClass("displayPanel");
        $("#sourceid").attr("src", question);
        //multi answer   
    },
    displayMultiAnswerQuestion: function (question) {
        $("#answer").removeClass("hidePanel").addClass("displayPanel");
        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
        $('#mainbody').html(question);
        //multi answer   
    },
    displaySortedMultiAnswerQuestion: function (question) {
        $("#answer").removeClass("hidePanel").addClass("displayPanel");
        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
        $('#mainbody').html(question);
        //multi answer   
    },
    updateCurrentQuestionLabel: function (currentQuestion, totalQuestions) {
        $('#current-question').html(currentQuestion + ' of ' + totalQuestions);
    },
    displayNoQuestion: function () {
        $("#answer").removeClass("displayPanel").addClass("hidePanel");
        $('#mainbody').html('no questions');
    },
    updateAnswerSoFar: function (answerSoFar) {
        $('#answer-so-far').html(answerSoFar);
    },
    setTitle: function (title) {
        $('#title').html(title);
    },

    setCSV: function (title) {
        // $('#title').html(title);
    },

    bindPrevQuestionEvt: function (callback, context) {

        var myArray = [-1];
        $('#prev').bind("vclick", function () { callback.apply(context, myArray); });

    },

    bindNextQuestionEvt: function (callback, context) {

        var myArray = [1];
        $('#next').bind("vclick", function () { callback.apply(context, myArray); });

    },





    bindSubmitEvt: function (callback, context) {
        $('#submit').bind("vclick", function () { callback.apply(context); });

    },

    bindAnswerButtonPress: function (callback, context) {
        $("#answer-box").keypress(function (event) {
            if (event.which == 13) {
                callback.apply(context);
                $('#mainbody').css('position', '');
                $('#mainbody').css('bottom', '');

            }
        });
    },

    bindCorrectAnswerButtonPress: function (callback, context) {

        var debounce = function (func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                }, wait);
                if (immediate && !timeout) func.apply(context, args);
            };
        };
        
        var myEfficientFn = debounce(function () {
   
            callback.apply(context);
        }, 500);
        

        $('#show-answer').bind("vclick", myEfficientFn);
        
    },


    bindSelectTestBtn: function (callback, context) {//context.listtests();

        $('#select').bind("vclick", function () {
            context.view.switchtab(1, function () { });
            callback.apply(context);
        }
        );
    },

    bindMainSelectBtn: function (callback, context) {//context.listtests();

        $('#main').bind("vclick", function () {
            context.view.switchtab(0, function () { });
            callback.apply(context);
        }
        );
    },
    bindCatBtn: function (callback, context) {//context.listtests();
        $('#cats').bind("vclick", function () {
            context.view.switchtab(1, function () { });
            callback.apply(context);
        }
        );
    },
    bindCsvBtn: function (callback, context) {//context.listtests();

        $('#csvs').bind("vclick", function () {
            context.view.switchtab(2, function () { });
            callback.apply(context);
        }
        );
    }


};