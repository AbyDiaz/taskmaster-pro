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

$(".list-group").on("click","p", function() {
  var text = $(this)
  .text()
  .trim();
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function() {
  // get textareas current value/text
  var text = $(this)
  .val()
  .trim();

  // get the parent ui's id attribute
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

  // unknown values so use variable names as placeholders
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

  // automatically focus on new element 
  dateInput.trigger("focus");
});

// convert back when user clicks out 

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
  .val()
  .trim();

  // get the parent ul's id attribute
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

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  // replace input with span element 
  $(this).replaceWith(taskSpan);
});

// .sortable() turned every element with the class list-group into a sortable list
$(".card .list-group").sortable ({
  // connectWith links the sortable list with any other lists that have the same class 
  connectWith: $(".card .list-group"),
  // sortable widget documentation
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  // activate and deactivate triggers oncce for all connected lists as soon as dragging starts and stops
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  // over and out trigger when dragged item enters or leaves connected list
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  // update triggers when the contents of the have changed.... items reordered, removed, added
  update: function(event) {
    // array to store the task data in
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this).children().each(function(){
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
$("#task-form-modal .btn-primary").click(function() {
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


