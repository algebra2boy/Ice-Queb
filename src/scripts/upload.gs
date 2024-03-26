const FACULTY_NAME_IDX = 0;
const COURSE_DPT_IDX = 2;
const COURSE_NUM_IDX = 3;
const OFFICE_HR_TIME_START_IDX = 4;
const NUM_OFFICE_HR_REQUIRED_ATTR = 5;
const API_URL = 'https://05b6-2601-182-d000-7700-f90f-223e-8c35-1467.ngrok-free.app/api/officeHour/upload'

function setUpTrigger() {
  ScriptApp.newTrigger('onSubmit')
    .forForm('1vZtl3GzTVFGFcvKPJfgTMQWUri_4c-aRcnjTzz_b0UI')
    .onFormSubmit()
    .create();
}

function onSubmit(e) {
  const form = FormApp.openById('1vZtl3GzTVFGFcvKPJfgTMQWUri_4c-aRcnjTzz_b0UI');

  // get all the responses from the google form
  const formResponses = form.getResponses();

  // get the last response
  const formResponse = formResponses[formResponses.length - 1];

  // get all the individual item from the last response
  const itemResponses = formResponse.getItemResponses();

  const facultyName = itemResponses[FACULTY_NAME_IDX].getResponse();
  const courseDpt = itemResponses[COURSE_DPT_IDX].getResponse();
  const courseNUM = itemResponses[COURSE_NUM_IDX].getResponse();

  const apiResponses = [];

  // iterate over each individual office hour from the last response
  for (var i = OFFICE_HR_TIME_START_IDX; i < itemResponses.length; i += (NUM_OFFICE_HR_REQUIRED_ATTR + 1)) {
    const officeHourSectionInfo = {
      facultyName: facultyName,
      courseDepartment: courseDpt,
      courseNumber: courseNUM,
      startDate: itemResponses[i].getResponse(),
      endDate: itemResponses[i].getResponse(),
      day: parseInt(itemResponses[i + 2].getResponse()),
      startTime: itemResponses[i + 3].getResponse(),
      endTime: itemResponses[i + 4].getResponse()
    };

    const response = sendRequest(officeHourSectionInfo);
    apiResponses.push(response)
  }

  // const recipient = e.response.getRespondentEmail();
  // const subject = "test user email";
  // const body = JSON.stringify(apiResponses);

  // GmailApp.sendEmail(recipient, subject, body);

  return apiResponses;
}

function sendRequest(officeHourSectionInfo) {
  try {
    const options = {
      method: 'POST',
      payload: JSON.stringify(officeHourSectionInfo),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = UrlFetchApp.fetch(API_URL, options);
    return response.getContentText();
  } catch (error) {
    Logger.log("Failed to send request: " + error.toString());
    FormApp.getUi().alert(`something is wrong + ${JSON.stringify(error)}`);
    return error;
  }
}

// function doGet() {
//   const response = onSubmit();
//   return ContentService.createTextOutput(response);
// }
