
var QuestionMaker = function () {
    

};

QuestionMaker.prototype = {
    
    MakeQuestion: function (testUrl,selectedcategory) {

    
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

                    if (cols[0] == this.selectedcategory) {

                        var questionType = 0; // default option

                        // questions with multiple answers
                        if (cols.length > 3) {

                            var colIdx = 2;
                            var answer = []; // this can get over written
                            var constAnswers = []; // to use a permanent answer collection

                            while (colIdx < cols.length) {
                                answer.push(cols[colIdx]);
                                constAnswers.push(cols[colIdx]);
                                colIdx++;
                            }

                            if (colIdx > 2) {
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


                            this.questionset.push({ question: cols[1], answer: answer, type: questionType, constAnswers: constAnswers, score: 0 });
                        } else {

                            questionType = (cols[1].indexOf(".jpg") !== -1) ? 2 : questionType;

                            this.questionset.push({ question: cols[1], answer: cols[2], type: questionType, constAnswers: cols[2], score: 0 });
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
            url: testUrl,
            async: false, // fine in  this situation
            data: "query=search_terms",
            success: $.proxy(finished, this)
        });
        



    },
    
    getColumns: function (row) {

        var cols = [];

        var tpSplit = row.split(',');

        $.each(tpSplit, function () {
            if ($.trim(this) != '') cols.push(String(this));
        });

        return cols;
    }
};
