import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class App extends Component {
  constructor (props) {
    super(props);
    const self = this;

    self.state = {
            events: new Map(), // Data structure to hold events data
            selected: null, // Date of the selected date on  calender
            current: null, // Date of the current month shown on  calender
            daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            daysLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthsLabel: ['January', 'February', 'March', 'April',
                        'May', 'June', 'July', 'August', 'September',
                        'October', 'November', 'December'],
            showPopup: false, // Control the show / hide popup
            popupTop: 0, // Control the popup top position
            popupLeft: 0, // Control the popup left position
            hour: 0, // variable for hour on popup
            minute: 0, // variable for minute on popup
            event: '', // event name on popup
            error: '', // error message on popup
            errorCount: 0,
            lowerLimit: new Date(1980, 11, 31),
            upperLimit: new Date(2024, 11, 31)
        };

    // Bind events to react class App to get access to state and props variables 
    self.handleChange = self.handleChange.bind(self);
    self.goBack = self.goBack.bind(self);
    self.goForward = self.goForward.bind(self);
    self.isLeapYear = self.isLeapYear.bind(self);
    self.addEvent = self.addEvent.bind(self);
    self.onCancel = self.onCancel.bind(self);
    this.dismissPopup = this.dismissPopup.bind(this);

    //event to dismiss popup
    document.addEventListener('click', self.dismissPopup, false);
  }

  // Called by React when component is mounted (initialized)
  componentDidMount () {
    constructort self = this;
    const currentDate = new Date();
    let state = self.state;
    let current = currentDate;

    self.isLeapYear(current);
    state.current = current;
    self.setState(state);

  }

  // Toggle back one month
  goBack() {
    const self = this;
    let state = self.state;
    let newDate = state.current.setMonth(state.current.getMonth() - 1);
    let current = new Date(newDate);
    self.isLeapYear(current);

    state.current = current;
    self.setState(state);
  }

  // Check leap year in current year.
  isLeapYear(date) {
    const self = this;
    let state = self.state;
    const isLeap = (new Date(date.getFullYear(), 1, 29).getDate() === 29);
    
    if (isLeap) state.daysInMonth[1] = 29;
    else state.daysInMonth[1] = 28;

    self.setState(state);
  }

  // Toggle forward one month
  goForward() {
    const self = this;
    let state = self.state;
    let newDate = state.current.setMonth(state.current.getMonth() + 1);
    let current = new Date(newDate);
    self.isLeapYear(current);

    state.current = current;
    self.setState(state);
  }

  // Select date, display popup
  selectDate(day, event) {
    const self = this;
    let state = self.state;

    let node = ReactDOM.findDOMNode(event.target);
    let popupBox = ReactDOM.findDOMNode(self.refs.popupBox);
    
    state.showPopup = true;
    state.popupTop = node.offsetTop - popupBox.clientHeight - 5;
    state.selected = new Date(state.current.getFullYear(), state.current.getMonth(), day);
    state.popupLeft = node.offsetLeft;

    self.setState(state);
  }

  // Event handler for adding event. Requires data validation and having success and error flows.
  addEvent() {
    const self = this;
    let state = self.state;
    
    const key = self.state.selected.getFullYear().toString() + "-" + self.state.selected.getMonth().toString();
    let arr = (state.events.has(key))? state.events.get(key): [];

    let hour = parseInt(self.state.hour, 10);
    let minute = parseInt(self.state.minute, 10);
    let event = self.state.event;
    let error = '';
    let errCount = 0;

    if (!event) {
      error += "Please specify a valid event name. "; 
      errCount++;
    }
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      error += "Hour must a number between 0 - 23. ";
      errCount++;
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      error += "minute must a number between 0 - 59. ";
      errCount++;
    }

    if (error) {
      state.popupTop = state.popupTop - (5 + (13 * (errCount - state.errorCount)));
      state.error = error;
      state.errorCount = errCount;

    } else {
      arr.push({
        date: new Date(self.state.selected.getFullYear(), self.state.selected.getMonth(), 
                      self.state.selected.getDate(), hour, minute),
        event: self.state.event
      });

      arr.sort((a,b) => {
        return a.date - b.date;
      });

      state.events.set(key, arr);
      state.selected = null;
      state.showPopup = false;
      state.popupTop = 0;
      state.popupLeft = 0;
      state.hour = 0;
      state.minute = 0;
      state.event = '';
      state.error = '';
      state.errorCount = 0;
    }

    self.setState(state);
  }

  handleChange(event) {
    const self = this;

    self.setState({
      [event.target.id]: event.target.value,
    });

  }

  // Check if the popup should be dismissed
  dismissPopup(event) {
    const self = this;
    let popupBox = ReactDOM.findDOMNode(self.refs.popupBox);

    // check if the click event happened on the popup and return.
    if (event.target.parentNode === popupBox || event.target === popupBox) {
      return;
    } else if (self.state.showPopup) { 
      // dimiss popup if the popup is visible and user clicked elsewhere
      self.onCancel();
    }
  }

  // On cancel reset the popup properties
  onCancel() {
    const self = this;
    let state = self.state;

    state.selected = null;
    state.showPopup = false;
    state.popupTop = 0;
    state.popupLeft = 0;
    state.hour = 0;
    state.minute = 0;
    state.event = '';
    state.error = '';
    state.errCount = 0;

    self.setState(state);
  }

  pad(n) {
    return n < 10 ? '0'+n : n
  }

  // Main rendering function on react
  render() {
    const self = this;
    let daysArr = [];
    let styles = {
      noBorder: {
        "border": "none",
        "width": "calc(13.6% + 2px)"
      },
      popupStyle: {
        "visibility": self.state.showPopup?"visible": "hidden",
        "top": self.state.popupTop,
        "left": self.state.popupLeft
      }
    }

    if (!self.state.current) {
      return(<div></div>);
    } else {
      const month = self.state.current.getMonth();
      const year = self.state.current.getFullYear();
      const lastDayOfMonthDateUpper = new Date(year, month, self.state.daysInMonth[month]);
      const lastDayOfMonthDateLower = new Date(year, month, self.state.daysInMonth[month]);
      const withinUpperLimit = (self.state.upperLimit.getTime() > lastDayOfMonthDateUpper.setMonth(lastDayOfMonthDateUpper.getMonth() + 1));
      const withinLowerLimit = (self.state.lowerLimit.getTime() < lastDayOfMonthDateLower.setMonth(lastDayOfMonthDateLower.getMonth() - 1));

      const key = year.toString() + "-" + month.toString();
      let eventElems = self.state.events.has(key)? self.state.events.get(key): [];
      let startMonthDate = new Date(year, month, 1);
      let todaysDate = new Date();
    
      for (let i = 0; i < startMonthDate.getDay(); i++) {
        daysArr.push(<li key={i + "-no-border"} style={styles.noBorder}></li>);
      }

      for (let j = 1; j <= self.state.daysInMonth[month]; j++) {
        let activeToday = (year === todaysDate.getFullYear() && month === todaysDate.getMonth() 
                          && j === todaysDate.getDate());
        
        daysArr.push(<li key={j + "-border"} 
                      onClick={self.selectDate.bind(self, j)} 
                      className={(activeToday)? "active": ""}>
                        {j}
                      </li>);
      }

      return (
        <div className="App">
          <div id='calendar-body'>
            <div className="month">
              <ul>
                {(withinLowerLimit)? <li className="prev" onClick={self.goBack}>&#10094;</li>:null}
                {(withinUpperLimit)? <li className="next" onClick={self.goForward}>&#10095;</li>:null}
                <li>
                  {self.state.monthsLabel[month]}<br/>
                  <span style={{"fontSize":"18px"}}>{year}</span>
                </li>
              </ul>
            </div>
            <ul className="weekdays">
              {self.state.daysLabels.map((day, index) => <li key={index + "-days"}>{day}</li>)}
            </ul>
            <ul className="days">
              {daysArr}
            </ul>
            <div className="popuptext popup" id="myPopup" ref="popupBox" style={styles.popupStyle}>
                <input type='number' min='1' max='23' step='1' name='hour' placeholder='Hour' id='hour' className='popup' value={self.state.hour} onChange={self.handleChange}/>
                <input type='number' min='1' max='59' step='1' name='minute' placeholder='Minute' id='minute' className='popup' value={self.state.minute} onChange={self.handleChange}/>
                <input type='text' name='event' id='event' placeholder='Event name' className='popup' value={self.state.event} onChange={self.handleChange}/>
                <button type="button" name="commit" onClick={self.addEvent}>Save</button>
                <div className="error">{self.state.error}</div>
            </div>
          </div>
          <ul id='events-list'>
            {eventElems.map((data, index) => {
              return <div key={key + "-" + index}>
                      {data.date.getDate() + " " + self.state.monthsLabel[data.date.getMonth()] + " " + data.date.getFullYear() + 
                      " " + self.pad(data.date.getHours()) + "-" + self.pad(data.date.getMinutes()) + ": " + data.event}
                    </div>
            })}
          </ul>
        </div>
      );
    }
    
  }
}

export default App;
