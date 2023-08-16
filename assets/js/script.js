var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// task text was clicked
$(".list-group").on("click","p", function() {
  var text = $(this)
  .text()
  .trim();
  // replace p element with new text area
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
  // auto focus new element 
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// editable field was unfocused
$(".list-group").on("blur", "textarea", function() {
  // get textareas current value/text
  var text = $(this)
  .val()
  .trim();

  // get status type and position in the list
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  // chaining this with attr, which returns the id, which will be list- followed by the category 
  .replace("list-", "");
  // once chained .replace will remove list- from the txt which will give us the category name 

  // get the tasks position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // update task in array and re-save to local storage 
  tasks[status][index].text = text;
  // tasks is an object
  // tasks status returns an array
  // tasks status index returnd the object at the given index in the array 
  // tasks status index . text returns the text propert of the object at the given index
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element 
  $(this).replaceWith(taskP);
});

// make due date date editable

// due date was clicked 
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
  .text()
  .trim();

  // create new input element 
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jQuery ui datepicker
  dateInput.datepicker({
    minDate:1,
    onclose: function() {
      // when calendar is closed, force a ' change ' event on the dateInput 
      $(this).trigger("change");
    }
  })

  // automatically bring up the calendar 
  dateInput.trigger("focus");
});

// convert back when user clicks out 

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
  .val()
  .trim();

  // get the parent ul's id attribute/ get staus and position in the list
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the tasks position in the list of the other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // update task in array and re-save to local storage 
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  // replace input with span element 
  $(this).replaceWith(taskSpan);

  // pass tasks li element into auditTask() to check new due date
  auditTask($(taskSpan).closest('.list-group-item'));
});

// .sortable() turned every element with the class list-group into a sortable list
// enable draggable/sortable feature on list group elements
$(".card .list-group").sortable ({
  // connectWith links the sortable list with any other lists that have the same class 
  connectWith: $(".card .list-group"),
  // sortable widget documentation
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  // activate and deactivate triggers oncce for all connected lists as soon as dragging starts and stops
  activate: function(event) {
    $(this).addClass("dropover");
    $('.bottom-trash').addClass('bottom-trash-drag');
  },
  deactivate: function(event) {
    $(this).removeClass("dropver");
    $('.bottom-trash').removeClass('bottom-trash-drag');
  },
  // over and out trigger when dragged item enters or leaves connected list
  over: function(event) {
    $(event.target).addClass("dropover-active");
    $('.bottom-trash').addClass('bottom-trash-active');
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
    $('.bottom-trash').removeClass('bottom-trash-active');
  },
  // update triggers when the contents of the have changed.... items reordered, removed, added
  update: function(event) {
    // array to store the task data in
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this)
    .children()
    .each(function(){
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
      .find("span")
      .text()
      .trim();

      // add task data to the temp array as an object
      tempArr.push ({
        text: text,
        date: date
      });
    });
    console.log(tempArr);
    // trim down lists ID to match object proerty 
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
}); 

// trash icon can be dropped on to 
$("#trash").droppable({
  accept: ".card .list-group-item",
  tollerance: "touch",
  drop: function(event, ui) {
    // removes the item when dropped into the red zone 
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log('out');
  }
});

// convert text field into a jQuery date picker
$('#modalDueDate').datepicker({
  // set min date to be one day from the current day 
  minDate: 1
});

var auditTask = function(taskEl) {
  // get date from task element 
  var date = $(taskEl)
  .find('span')
  .text()
  .trim();

  // convert to moment object at 5pm
  var time = moment(date, "L").set('hour', 17);
  // remove any old classes from element 
  $(taskEl).removeClass('list-group-item-warning list-group-item-danger');

  // apply new class if task is near/over due date 
  if (moment().isAfter(time)) {
    $(taskEl).addClass('list-group-item-danger');
  }
  // use moment to get 'right now'.... use .diff after to get the difference
  // of right now to a day in the future, get a negative number back 
  // think when people say 't minus ten seconds '
  // wrapped returning val in the moment.diff in the .abs so we get the absolute value of the number
  else if (Math.abs(moment().diff(time, 'days')) <= 2) {
    $(taskEl).addClass('list-group-item-warning');
  }
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push ( {
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

setInterval(function() {
  $('.card .list-group-item').each(function(index, el) {
    auditTask(el);
  });
}, (1000 * 60) * 30);
