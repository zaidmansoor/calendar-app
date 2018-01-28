import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class App extends Component {
  constructor (props) {
    super(props);
    const self = this;

    self.state = {
            events: new Map(),
            selected: null,
            current: null,
            daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            daysLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthsLabel: ['January', 'February', 'March', 'April',
                        'May', 'June', 'July', 'August', 'September',
                        'October', 'November', 'December'],
            showPopup: false,
            popupTop: 0,
            popupLeft: 0,
            hour: 0,
            minute: 0,
            event: ''
        };

    self.handleChange = self.handleChange.bind(self);
    self.goBack = self.goBack.bind(self);
    self.goForward = self.goForward.bind(self);
    self.isLeapYear = self.isLeapYear.bind(self);
    self.addEvent = self.addEvent.bind(self);
    self.onCancel = self.onCancel.bind(self);
  }

  componentDidMount () {
    const self = this;
    const currentDate = new Date();
    let state = self.state;
    let current = currentDate;

    self.isLeapYear(current);
    state.current = current;
    self.setState(state);

  }

  goBack() {
    const self = this;
    let state = self.state;
    let newDate = state.current.setMonth(state.current.getMonth() - 1);
    let current = new Date(newDate);
    self.isLeapYear(current);

    state.current = current;
    self.setState(state);
  }

  isLeapYear(date) {
    const self = this;
    let state = self.state;
    const isLeap = (new Date(date.getFullYear(), 1, 29).getDate() === 29);
    
    if (isLeap) state.daysInMonth[1] = 29;
    else state.daysInMonth[1] = 28;

    self.setState(state);
  }

  goForward() {
    const self = this;
    let state = self.state;
    let newDate = state.current.setMonth(state.current.getMonth() + 1);
    let current = new Date(newDate);
    self.isLeapYear(current);

    state.current = current;
    self.setState(state);
  }

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

  addEvent() {
    const self = this;
    let state = self.state;
    
    const key = self.state.selected.getFullYear().toString() + "-" + self.state.selected.getMonth().toString();
    let arr = (state.events.has(key))? state.events.get(key): [];

    arr.push({
      date: new Date(self.state.selected.getFullYear(), self.state.selected.getMonth(), 
                    self.state.selected.getDate(), self.state.hour, self.state.minute),
      event: self.state.event
    });

    arr.sort((a,b) => {
      return a.date - b.date;
    })

    state.events.set(key, arr);
    state.selected = null;
    state.showPopup = false;
    state.popupTop = 0;
    state.popupLeft = 0;
    state.hour = 0;
    state.minute = 0;
    state.event = '';

    self.setState(state);
  }

  handleChange(event) {
    const self = this;

    self.setState({
      [event.target.id]: event.target.value,
    });

  }

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

    self.setState(state);
  }

  pad(n) {
    return n < 10 ? '0'+n : n
  }

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
      let month = self.state.current.getMonth();
      let year = self.state.current.getFullYear()

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
                <li className="prev" onClick={self.goBack}>&#10094;</li>
                <li className="next" onClick={self.goForward}>&#10095;</li>
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
                <button type="button" name="commit" onClick={self.onCancel}>Cancel</button>
                <button type="button" name="commit" onClick={self.addEvent}>Save</button>
                
            </div>
          </div>
          <ul id='events-list'>
            {eventElems.map((data, index) => {
              return <div key={key + "-" + index}>
                      {data.date.getDate() + " " + self.state.monthsLabel[data.date.getMonth()] + " " + data.date.getFullYear() + 
                      " " + self.pad(data.date.getHours()) + ":" + self.pad(data.date.getMinutes()) + " - " + data.event}
                    </div>
            })}
          </ul>
        </div>
      );
    }
    
  }
}

export default App;
