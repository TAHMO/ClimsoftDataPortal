import React from "react";
import classNames from "classnames";
import {
  InputGroup,
  DatePicker,
  InputGroupAddon,
  InputGroupText
} from "shards-react";

import "../../assets/range-date-picker.css";

class RangeDatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startDate: (props.startDate) ? props.startDate : undefined,
      endDate: (props.endDate) ? props.endDate : undefined,
      minDate: (props.minDate) ? props.minDate : undefined,
      maxDate: (props.maxDate) ? props.maxDate : undefined
    };

    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
  }

  changeLimit(minDate, maxDate) {
    this.setState({ minDate: minDate, maxDate: maxDate });
  }

  setDates(startDate, endDate) {
    this.handleStartDateChange(startDate);
    this.handleEndDateChange(endDate);
  }

  handleStartDateChange(value) {
    this.setState({
      ...this.state,
      ...{ startDate: new Date(value) }
    });
  }

  handleEndDateChange(value) {
    this.setState({
      ...this.state,
      ...{ endDate: new Date(value) }
    });
  }

  render() {
    const { className } = this.props;
    const classes = classNames(className, "d-flex", "my-auto", "date-range");

    return (
      <InputGroup className={classes}>
        <DatePicker
          size="sm"
          dateFormat="yyyy-MM-dd"
          selected={this.state.startDate}
          onChange={this.handleStartDateChange}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          placeholderText="Start Date"
          dropdownMode="select"
          className="text-center"
        />
        <DatePicker
          size="sm"
          dateFormat="yyyy-MM-dd"
          selected={this.state.endDate}
          onChange={this.handleEndDateChange}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          placeholderText="End Date"
          dropdownMode="select"
          className="text-center"
        />
        <InputGroupAddon type="append">
          <InputGroupText>
            <i className="material-icons">&#xE916;</i>
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    );
  }
}

export default RangeDatePicker;
