var options = {
		host: '',
		login: '',
		password: ''
}

var tagsMap = {
		no_answer: 'No answer',
		emergency_real: '',
		call_out_test: '',
		call_out_real: '',
		start: '',
		stop: '',
		confirmed: 'Confirmed',
		refused: 'Refused',
		wrong_pin: 'Wrong pin',
		no_pin: 'No pin',
		correct_pin: 'Correct pin',
}


$(document).ready(function() {

	$.ajaxSetup({
		crossDomain: true,
		xhrFields: {
			withCredentials: true
		}
	});


	loadSettings();

	$('#settings-modal-host').val(options.host);
	$('#settings-modal-login').val(options.login);
	$('#settings-modal-password').val(options.password);


    $('#settings-btn').on('click', function(){
    	$("#settings-modal").modal('show');
    });


    $('#export-btn').on('click', function(){
    	exportTableToCSV.apply(this);
    });

    $('#update-button').on('click', function(){
    	startTimer();
    	loadData();
    });


    $('#from-date').datetimepicker({
        dateFormat: "dd/mm/yy",
        timeFormat: 'HH:mm',
        changeMonth: true,
        changeYear: true,
        showButtonPanel: false,
        onSelect: function(){
        	stopTimer()
        	$('#from-date').datetimepicker('hide');
        	$('#to-date').datetimepicker('option', 'minDate', $('#from-date').datetimepicker('getDate') );
        },
        onClose: function(dateText, inst) {
    		if ($('#to-date').val() != '') {
    			var testStartDate = $('#from-date').datetimepicker('getDate');
    			var testEndDate = $('#to-date').datetimepicker('getDate');
    			if (testStartDate > testEndDate)
    				$('#to-date').datetimepicker('setDate', testStartDate);
    		}
    		else {
    			$('#to-date').val(dateText);
    		}
    	},
    });

    $('#to-date').datetimepicker({
        dateFormat: "dd/mm/yy",
        timeFormat: 'HH:mm',
        changeMonth: true,
        changeYear: true,
        showButtonPanel: false,
        onSelect: function(){
        	stopTimer();
        	$('#to-date').datetimepicker('hide');
        	$('#from-date').datetimepicker('option', 'maxDate', $('#to-date').datetimepicker('getDate') );
        },
        onClose: function(dateText, inst) {
    		if ($('#from-date').val() != '') {
    			var testStartDate = $('#from-date').datetimepicker('getDate');
    			var testEndDate = $('#to-date').datetimepicker('getDate');
    			if (testStartDate > testEndDate)
    				$('#from-date').datetimepicker('setDate', testEndDate);
    		}
    		else {
    			$('#from-date').val(dateText);
    		}
    	},
    });

    var yesterdayDate = new Date();
    yesterdayDate.setHours(0);
    yesterdayDate.setMinutes(0);
	$("#from-date").datetimepicker("setDate", yesterdayDate);

	yesterdayDate.setHours(23);
    yesterdayDate.setMinutes(59);
	$("#to-date").datetimepicker("setDate",  yesterdayDate);


	$('#settings-modal-save-button').on('click', function(){
    	localStorage.setItem("host", $('#settings-modal-host').val());
    	localStorage.setItem("login", $('#settings-modal-login').val());
    	localStorage.setItem("password", $('#settings-modal-password').val());

    	loadSettings();

    	$("#settings-modal").modal('hide');

    	if(isFilledSettings()){
    		initialise();
    	}
    });

    $('#error-modal-save-button').on('click', function(){
    	$('#error-modal').modal('hide');
    });

    initialise();
});

function initialise(){

	if(isFilledSettings()){
		$.ajax({
    		url: location.protocol+'//'+options.host+'/api/v1/personal/login',
    		type: 'POST',
    		data: {
    			login: options.login,
    			password: options.password
    		},
    		success:function(){
    			loadData();
    		},
    		error: function(jqXHR, textStatus, errorThrown){
    			if(jqXHR.responseText && jqXHR.responseText!=''){
    				var response = $.parseJSON(jqXHR.responseText);
    				if(response && response['type'] && response['type'] == 'error' && response['reason']){
    					showError(response['reason']);
    				}else{
    					showError("Login failed<br>Response: "+jqXHR.responseText);
    				}
    			}else{
    				showError('Login failed '+errorThrown);
    			}
    		}
    	});
	}else{
		$("#settings-modal").modal('show');
	}
}

function isFilledSettings(){
	if(options.host != '' && options.login != '' && options.password != ''){
		return true;
	}
	return false;
}
function loadSettings(){
	$.each(['host', 'login', 'password'], function(i, key){
		var val = localStorage.getItem(key);
		if(val){
			options[key] = val;
		}
	});
}

var _loadTimer = null;
function startTimer(){
	stopTimer();
	_loadTimer = setInterval(function(){
		loadData(true);
	}, 5000);
}


function stopTimer(){
	if(_loadTimer){
		clearInterval(_loadTimer);
		_loadTimer = null;
	}
}

function showError(message){
	$('#error-modal .modal-body').html(message);
	$('#error-modal').modal('show');
}

function loadData(withoutMask){

	var fromDate = $("#from-date").datetimepicker("getDate");

	if(fromDate){
		fromDate = fromDate.format('yyyy-mm-dd HH:MM');
	}
	var toDate = $("#to-date").datetimepicker("getDate");
	if(toDate){
		toDate = toDate.format('yyyy-mm-dd HH:MM');
	}


	var filter = {
			start: {
				from: fromDate,
				to: toDate
			},
			type: {
            	not: 'fax'
            }
	}
	if(!withoutMask){
		$(".body_wrapper").mask('Loading ...');
	}

	$.ajax({
		url: location.protocol+'//'+options.host+'/scripts/AlertCalls.php',
		type: 'GET',
		data: {
			filter: filter
		},
		success:function(response, textStatus, jqXHR){
			$(".body_wrapper").unmask();

			if($.isArray(response)){
				printData(response)
			}else{
				stopTimer();
				showError("Unknown format: "+jqXHR.responseText);
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			$(".body_wrapper").unmask();
			stopTimer();
			showError(errorThrown+"<br>Response: "+(jqXHR.responseText || ""));
		}
	});
}



function printData(data){

	if(data.length == 0){
		$('#content').html('No records found')
		return;
	}

	var result = {};
	var numberLink = {};
	for(var i=0; i < data.length; i++){
		var id = data[i]['src'];
		var name = data[i]['to_name']
		var number = data[i]['to_number']
		var tags = data[i]['lastdata'].replace(/^tags:/, '');
		tags = $.map(tags.split(","), $.trim);

		if(!result[id]){
			result[id] = {
					start: null,
					end: '',
					real: false,
					contacts: {}
			};
			numberLink[id]= {};
		}


		if(!result[id]['contacts'][name]){
			result[id]['contacts'][name] = {};
			numberLink[id][name] = [];
		}

		if(!result[id]['contacts'][name][number]){
			numberLink[id][name].push(number);
			result[id]['contacts'][name][number] = {
					calls: []
			}
		}

		var item = {
				id: id,
				number: number,
				name: name,
				start: new Date(data[i]['start'].replace(/-/g, "/")),
				end: new Date(data[i]['end'].replace(/-/g, "/")),
				tags:tags
		};

		if($.inArray('stop', tags) >= 0){
			result[id].end = item.end;
		}

		if($.inArray('call_out_real', tags) >= 0){
			result[id].real = true;
		}

		if(!result[id].start){
			if($.inArray('start', tags) >= 0){
				result[id].start = item.start;
			}
		}

		result[id]['contacts'][name][number]['calls'].push(item);
	}


	var html = '';
	$.each(result, function(id, pool){

		html += "<div class='callout'>";
		html += '<table class="table table-hover" width="100%">';
		html +='<thead>';
		html +="<tr>" +
				"<th colspan='2'>" +
					"<span class='type'>"+((pool.real)? 'Real': 'Test')+" </span>" +
					"<span class='date'>"+((pool.start)?pool.start.format('yyyy/mm/dd'): "")+"</span> " +
					"<span class='time'>"+((pool.start)?pool.start.format('HH:MM'): "")+' - '+((pool.end)?pool.end.format('HH:MM'): "")+"</span>" +
				"</th>" +
				"<th></th>" +
				"<th></th>" +
				"</tr>";
		html +='</thead>';
		html +='<tbody>';
		$.each(pool.contacts, function(name, numbers){
			html +='<tr><th rowspan="'+countCalls(numbers)+'">'+name+'</th></tr>';
			for(var i=0; i < numberLink[id][name].length; i++){

				var calls = numbers[numberLink[id][name][i]].calls;
				for(var j=0; j < calls.length; j++){

					html +='<tr><td>'+calls[j].number+'</td><td>'+calls[j].start.format('yyyy/mm/dd HH:MM:ss')+' - '+calls[j].end.format('HH:MM:ss')+'</td><td>'+getTags(calls[j].tags)+'</td></tr>';
				}
			}

		});
		html +='</tbody>';
		html+='</table></div>';
	});

	$('#content').html(html);
}



function countCalls(numbers){
	var count = 1;
	$.each(numbers, function(number, callsPool){
		count+=callsPool.calls.length;
	});

	return count;
}

function getTags(tags){
	var result = [];
	for(var i=0; i < tags.length; i++){
		var tag = tags[i];
		if(tagsMap.hasOwnProperty(tag)){
			tag = tagsMap[tag];
		}

		if(tag!=''){
			result.push(tag);
		}
	}
	return result.join(', ');
}


function exportTableToCSV() {
	var $table = $('#content .callout table');
	var filename = 'export.csv';

    var $rows = $table.find('tr'),

        // Temporary delimiter characters unlikely to be typed by keyboard
        // This is to avoid accidentally splitting the actual contents
        tmpColDelim = String.fromCharCode(11), // vertical tab character
        tmpRowDelim = String.fromCharCode(0), // null character

        // actual delimiter characters for CSV format
        colDelim = '","',
        rowDelim = '"\r\n"',

        // Grab text from table into CSV formatted string
        csv = '"' + $rows.map(function (i, row) {
            var $row = $(row),
                $cols = $row.find('td, th');

            return $cols.map(function (j, col) {
                var $col = $(col),
                    text = $col.text();

                return text.replace(/"/g, '""'); // escape double quotes

            }).get().join(tmpColDelim);

        }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"',

        // Data URI
        csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

    $(this)
        .attr({
        'download': filename,
            'href': csvData,
            'target': '_blank'
    });
}
