

var Questionnaire = function () {

    this.view = new QView();

    this.is_keyboard = false;
    this.is_landscape = false;
    this.initial_screen_size = window.innerHeight;
    this.qryStrUtils = new QryStrUtils();
    this.ancUtils = new AncUtils();




    this.selectedcategory = '';
    this.selectedCSV = 3;
    this.testcategories = [];
    this.questionset = [];
    this.answerset = [];

    // used for multi answer questions
    this.currentQuestionState = [];


    this.isAnswerDisplayed = false;


    this.currentQuestionIdx = 0;
    this.score = 0;
    this.questionscore = 0;

    this.tests = [];

    this.tests.push({ key: 'aspnet', value: 'questionnaire/Questions/aspnet.csv' });
    this.tests.push({ key: 'c_sharp', value: 'questionnaire/Questions/c_sharp.csv' });
    this.tests.push({ key: 'javascript', value: 'questionnaire/Questions/javascript.csv' });
    this.tests.push({ key: 'oop', value: 'questionnaire/Questions/oop.csv' });
    this.tests.push({ key: 'samples', value: 'questionnaire/Questions/samples.csv' });




    this.view.bindNextQuestionEvt(this.displayQuestion, this);

    this.view.bindPrevQuestionEvt(this.displayQuestion, this);

    this.view.bindSubmitEvt(this.answerQuestion, this);

    this.view.bindAnswerButtonPress(this.answerQuestion, this);

    this.view.bindCorrectAnswerButtonPress(this.toggleAnswer, this);

    this.view.bindSelectTestBtn(this.listtests, this);

    this.view.bindMainSelectBtn(this.createquestionset, this);

    this.view.bindCatBtn(this.listtests, this);

    this.view.bindCsvBtn(this.listcsvs, this);


};


Questionnaire.prototype = {
    writelog: function (message) {
        //  $('#debug').append(message+'.');
    },

    getColumns: function (row) {

        var cols = [];

        var tpSplit = row.split(',');

        $.each(tpSplit, function () {
            if ($.trim(this) != '') cols.push(String(this));
        });

        return cols;
    },

    getTestCategories: function (rows, catColIdx) {


        var tp = [];

        var idx = 1;
        while (idx < rows.length) {

            var cols = this.getColumns(rows[idx]);

            tp.push(cols[catColIdx]);
            idx++;
        }


        try {
            var uniqueNames = [];


            $.each(tp, function (i, el) {


                if ($.inArray(el, uniqueNames) === -1)
                    uniqueNames.push(el);


            });

            tp = uniqueNames;
        } catch (e) {

        }

        return tp;
    },

    getCats: function (callselect, action) {



        try {
            var finished = function (result) {

                this.testcategories = this.getTestCategories(result.split('\x0A'), 1);

                if (this.testcategories.length > 0 && this.testcategories[0] !== undefined) {

                    if (callselect) {
                        this.processSelect(this.testcategories[0]);
                    }

                    //  this.createquestionset();

                }

                action();
            };

            $.ajax({
                url: this.tests[this.selectedCSV].value,
                data: "query=search_terms",
                success: $.proxy(finished, this)
            });



        } catch (e) {

        }

    },

    init: function () {


        // load the selected csv file

        this.getCats(true, function () {

        });


    },

    listcsvs: function () {

        var idx = 0;
        var displayCSV = [];

        while (idx < this.tests.length) {

            displayCSV.push(this.tests[idx].key);
            idx++;
        }

        this.view.createCSVList(displayCSV, this.processTestSelect, this);
    },

    hideAnswer: function () {
        this.view.DisplayCorrectAnswer('');
        this.isAnswerDisplayed = false;
    },
    toggleAnswer: function () {




        if (this.isAnswerDisplayed == true) {
            this.view.DisplayCorrectAnswer('');
            this.isAnswerDisplayed = false;

        } else {
            var answers = this.questionset[this.currentQuestionIdx].answer;
            var correctAnswer = '';

            var idx = 0;
            if (this.questionset[this.currentQuestionIdx].type != 0) {
                while (idx < answers.length) {

                    var formatClass = '';


                    if (idx % 2 == 0) {
                        formatClass = 'alt-cAnswer1';
                    } else {
                        formatClass = 'alt-cAnswer2';
                    }

                    correctAnswer += '<span class ="' + formatClass + '">' + answers[idx] + '</span>';

                    if (idx < answers.length - 1)
                        correctAnswer += ',';
                    idx++;
                }
            } else {
                correctAnswer = this.questionset[this.currentQuestionIdx].constAnswers;
            }

            this.view.DisplayCorrectAnswer(correctAnswer);

            this.isAnswerDisplayed = true;
        }


    },

    listtests: function () {


        this.view.createCatList(this.testcategories, this.processSelect, this);
    },

    answerQuestion: function () {

        var answer = this.view.GetAnswer();

        //get question type
        var type = this.questionset[this.currentQuestionIdx].type;

        switch (type) {
            case 0:
                // standard question
                this.getScoreBasic(answer);
                break;
            case 1:
                // select single answer from possible answers      
                this.getScoreBasic($("input[name*=radio-choice]:checked").val());
                break;
            case 2:
                // image question

                break;
            case 3:
                // multiple answers
                this.getScoreMultiAnswer(answer);
                break;
            case 4:
                // multiple answers
                this.getScoreOrderedMultiAnswer(answer);
                break;
        }

        this.questionset[this.currentQuestionIdx].score = this.questionscore;


        var idx = 0;
        var working = 0;
        while (idx < this.questionset.length) {
            working += this.questionset[idx].score;
            idx++;
        }


        this.score = Math.floor(((100 / (this.questionset.length * 100)) * working));

        this.view.DisplayScore(this.questionscore, this.score);


    },

    getScoreBasic: function (answer) {
        // record our answer
       // console.log('getscorebasic');
        
   //     console.log(this.currentQuestionIdx);
     //   console.log(answer);
      //  console.log(this.answerset.length);
        
        //this.answerset[this.currentQuestionIdx] = answer;

        ////recalculate score
        //var idx = 0;

        //this.questionscore = 0;

        //while (idx < this.answerset.length) {

        //    var tpAnswer = '';
        //    var tpQuestion = '';

        //    console.log(this.questionset[idx].answer);
            

        //    if ($.isArray(this.questionset[idx].answer)) {
        //        tpAnswer = this.questionset[idx].answer[0];
        //        console.log(this.questionset[idx].answer[0]);
        //    } else {
        //        tpAnswer = this.questionset[idx].answer;
        //    }

        var scoreFactor = 100/this.answerset.length;

        if (this.performMatch(answer, this.questionset[this.currentQuestionIdx].answer)) {
            this.questionscore = scoreFactor;
        } else {
            this.questionscore = 0;
        }
        //    idx++;
        //}




    //    this.questionscore = Math.floor(((100 / this.answerset.length) * this.questionscore));


    },

    performMatch: function (answer, solution) {

        answer = String(answer).toLowerCase();

        solution = String(solution).toLowerCase();



        if ($.trim(answer) == $.trim(solution)) {
            return true;
        } else {
            return false;
        }
    },

    getScoreMultiAnswer: function (answer) {

        // get all answers
        // make list of remaining questions that havent been answered correctly
        // make list of answers that are right
        //  var content = this.questionset[this.currentQuestionIdx].question;
        var remainingAnswers = [];
        var answers = this.questionset[this.currentQuestionIdx].answer;
        var originalAnswers = this.questionset[this.currentQuestionIdx].constAnswers;
        var idx = 0;

        while (idx < answers.length) {

            if (this.performMatch(answers[idx], answer)) {
                this.currentQuestionState.push(answer);
            } else {
                remainingAnswers.push(answers[idx]);
            }
            idx++;
        }

        this.questionset[this.currentQuestionIdx].answer = remainingAnswers;

        this.questionscore = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length));

        this.view.updateBoxs(this.currentQuestionState, this.questionset[this.currentQuestionIdx].answer, this.questionset[this.currentQuestionIdx].question, '');
    },

    getScoreOrderedMultiAnswer: function (answer) {

        var answers = this.questionset[this.currentQuestionIdx].answer;
        var originalAnswers = this.questionset[this.currentQuestionIdx].constAnswers;

        var remainingAnswers = answers;

        if (this.performMatch(answers[0], answer)) {
            this.currentQuestionState.push(answer);
            remainingAnswers.splice(0, 1);
        }

        this.questionset[this.currentQuestionIdx].answer = remainingAnswers;

        this.questionscore = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length));

        this.view.updateBoxs(this.currentQuestionState, this.questionset[this.currentQuestionIdx].answer, this.questionset[this.currentQuestionIdx].question, '');
    },

    processSelect: function (cat) {

        var ithat = this;

        ithat.selectedcategory = cat;

        ithat.view.switchtab(0, function () {
            ithat.createquestionset();
        });

        ithat.view.setTitle(cat);
    },

    processTestSelect: function (cat) {

        var ithat = this;

        // ithat.selectedCSV = cat;

        var idx = 0;


        while (idx < ithat.tests.length) {

            if (ithat.tests[idx].key == cat)
                ithat.selectedCSV = idx;
            idx++;
        }

        console.log(cat + ' ' + ithat.selectedCSV);

        ithat.view.switchtab(1, function () {

            ithat.getCats(false, function () {
                ithat.view.createCatList(ithat.testcategories, ithat.processSelect, ithat);
            });

            //    ithat.createquestionset();
        });

        ithat.view.setCSV(cat);
    },


    createquestionset: function () {
        //0 standard type
        //
        this.writelog('cqs');

        $('#mainbody').html('');
        $('#perc-correct').html('');
        $('#question-score').html('');
        $('#answer-so-far').html('');

        var questionColIdx = 2;
        var multiAnswerStartIdx = 3;

        var finished = function (result) {
            //     var headersection = '';
            var rows = result.split('\x0A');
            var idx = 1;
            this.questionset = [];
            this.answerset = [];

            try {


                while (idx < rows.length) {

                    //  this.writelog(idx);

                    var cols = this.getColumns(rows[idx]);

                    if (cols[1] == this.selectedcategory) {

                        var questionType = 0; // default option

                        // questions with multiple answers
                        if (cols.length > multiAnswerStartIdx+1) {

                            var colIdx = multiAnswerStartIdx;
                            var answer = []; // this can get over written
                            var constAnswers = []; // to use a permanent answer collection

                            while (colIdx < cols.length) {
                                answer.push(cols[colIdx]);
                                constAnswers.push(cols[colIdx]);
                                colIdx++;
                            }

                            if (colIdx > multiAnswerStartIdx) {
                                switch ($.trim(answer[0])) {
                                    case 'MA':
                                        questionType = 3; // multi answer
                                        break;
                                    case 'MS':
                                        questionType = 4; // multi ordered answer
                                        break;
                                    default:
                                        questionType = 1; //question is multiple choice
                                        break;
                                }
                            }

                            // questiontype is multiple choice
                            if (questionType != 1) {
                                answer.splice(0, 1);
                                constAnswers.splice(0, 1);
                            } else {
                                this.answerset.push('');

                            }


                            this.questionset.push({ question: cols[questionColIdx], answer: answer, type: questionType, constAnswers: constAnswers, score: 0 });
                        } else {

                            questionType = (cols[1].indexOf(".jpg") !== -1) ? 2 : questionType;

                            this.questionset.push({ question: cols[questionColIdx], answer: cols[multiAnswerStartIdx], type: questionType, constAnswers: cols[3], score: 0 });
                            this.answerset.push('');
                        }
                    }


                    idx++;
                }

                this.displayQuestion(0);


            } catch (e) {
                $('#debug').html('exc' + e);
            }


        };


        $.ajax({
            url: this.tests[this.selectedCSV].value,
            data: "query=search_terms",
            success: $.proxy(finished, this)
        });
    },

    displayQuestion: function (pos) {

        this.currentQuestionState = [];

        this.writelog('dq' + pos);

        switch (pos) {
            case 1:
                if (this.questionset.length - 1 > this.currentQuestionIdx)
                    this.currentQuestionIdx++;
                break;
            case -1:
                if (this.currentQuestionIdx > 0)
                    this.currentQuestionIdx--;
                break;
            default:
                this.currentQuestionIdx = 0;
        }
        this.hideAnswer();
        
        //  $('#answer-so-far').html('');

        //updateAnswerSoFar
        this.view.updateAnswerSoFar('');

        if (this.questionset !== undefined && this.questionset.length > 0) {
            var type = this.questionset[this.currentQuestionIdx].type;

            this.questionset[this.currentQuestionIdx].answer = this.questionset[this.currentQuestionIdx].constAnswers;

            this.view.DisplayScore('0');

            this.questionscore = 0;

            switch (type) {
                case 0:
                    this.view.displayStandardQuestion(this.questionset[this.currentQuestionIdx].question, this.answerset[this.currentQuestionIdx]);
                    break;
                case 1:
                    this.view.displayMultipleChoice(this.questionset[this.currentQuestionIdx].question, this.questionset[this.currentQuestionIdx].constAnswers, parseInt(this.answerset[this.currentQuestionIdx]) + 1);
                    break;
                case 2:
                    this.view.displayImageQuestion(this.questionset[this.currentQuestionIdx].question, this.answerset[this.currentQuestionIdx]);
                    break;
                case 3:// multi answer
                    this.view.displayMultiAnswerQuestion(this.questionset[this.currentQuestionIdx].question);
                    break;
                case 4:// multi ordered answer
                    this.view.displayMultiAnswerQuestion(this.questionset[this.currentQuestionIdx].question);
                    break;
            }
            this.view.updateCurrentQuestionLabel(this.currentQuestionIdx + 1, this.questionset.length);

        } else {
            this.view.displayNoQuestion();
        }


        //  $('#mainbody').html(content);
        //how long did it take to work out i needed to call this - on a containing div not the content!!
        $("#rqs").trigger('create');

    }
};
