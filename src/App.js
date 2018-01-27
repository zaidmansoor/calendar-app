import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor (props) {
    super(props);
    const self = this;

    self.state = {
            events: new Map(),
            selected: null,
            daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            daysLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthsLabel: ['January', 'February', 'March', 'April',
                        'May', 'June', 'July', 'August', 'September',
                        'October', 'November', 'December']
        };

    self.goBack = self.goBack.bind(self);
    self.goForward = self.goForward.bind(self);
  }

  componentDidMount () {
    const self = this;
    const currentDate = new Date();
    let state = self.state;

    const isLeap = (new Date(currentDate.getFullYear(), 1, 29).getDate() === 29);
    if (isLeap) state.daysInMonth[1] = 29;

    let selected = currentDate
    state.selected = selected;
    self.setState(state);

  }

  goBack() {
    const self = this;
    let state = self.state;
    let newDate = state.selected.setMonth(state.selected.getMonth() - 1);

    const isLeap = (new Date(state.selected.getFullYear(), 1, 29).getDate() === 29);

    if (isLeap) state.daysInMonth[1] = 29;
    else state.daysInMonth[1] = 28;

    let selected = new Date(newDate);

    state.selected = selected;
    self.setState(state);
  }

  goForward() {
    const self = this;
    let state = self.state;
    let newDate = state.selected.setMonth(state.selected.getMonth() + 1);

    const isLeap = (new Date(state.selected.getFullYear(), 1, 29).getDate() === 29);
    
    if (isLeap) state.daysInMonth[1] = 29;
    else state.daysInMonth[1] = 28;

    let selected =  new Date(newDate);
    state.selected = selected;

    self.setState(state);
  }

  addEvent(day) {
    const self = this;
    let state = self.state;

    const key = self.state.selected.getFullYear().toString() + "-" + self.state.selected.getMonth().toString();
    let arr = (state.events.has(key))? state.events.get(key): [];

    arr.push({
      day: day,
      month: state.monthsLabel[state.selected.getMonth()],
      year: state.selected.getFullYear()
    });

    state.events.set(key, arr);
    self.setState(state);

  }

  render() {
    const self = this;
    let daysArr = [];
    let styles = {
      noBorder: {
        "border": "none",
        "width": "calc(13.6% + 2px)"
      }
    }

    if (!self.state.selected) {
      return(<div></div>);
    } else {
      const key = self.state.selected.getFullYear().toString() + "-" + self.state.selected.getMonth().toString();
      let eventElems = self.state.events.has(key)? self.state.events.get(key): [];
      let startMonthDate = new Date(self.state.selected.getFullYear(), self.state.selected.getMonth(), 1);
    
      for (let i = 0; i < startMonthDate.getDay(); i++) {
        daysArr.push(<li key={i + "-no-border"} style={styles.noBorder}></li>);
      }

      for (let j = 1; j <= self.state.daysInMonth[self.state.selected.getMonth()]; j++) {
        daysArr.push(<li key={j + "-border"} onClick={self.addEvent.bind(self, j)}>{j}</li>);
      }

      return (
        <div className="App">
          <div id='calendar-body'>
            <div className="month">
              <ul>
                <li className="prev" onClick={self.goBack}>&#10094;</li>
                <li className="next" onClick={self.goForward}>&#10095;</li>
                <li>
                  {self.state.monthsLabel[self.state.selected.getMonth()]}<br/>
                  <span style={{"fontSize":"18px"}}>{self.state.selected.getFullYear()}</span>
                </li>
              </ul>
            </div>
            <ul className="weekdays">
              {self.state.daysLabels.map((day, index) => <li key={index + "-days"}>{day}</li>)}
            </ul>
            <ul className="days">
              {daysArr}
            </ul>
            <div className="popuptext popup" id="myPopup">
                <input type='number' min='1' max='23' step='1' name='H' placeholder='Hour' id='hour' className='popup'/>
                <input type='number' min='1' max='59' step='1' name='M' placeholder='Minute' id='min' className='popup'/>
                <input type='text' name='evenName' id='event' placeholder='Event name' className='popup'/>
                <input type="submit" name="commit" value="Save" id="submit_form" className='popup'/>
            </div>
          </div>
          <ul id='events-list'>
            {eventElems.map((data, index) => {
              return <div key={key + "-" + index}>{data.day + " " + data.month + " " + data.year}</div>
            })}
          </ul>
        </div>
      );
    }
    
  }
}

export default App;
