import React from 'react';
import { Route } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { CheckCircle, Edit, Thermometer } from 'react-feather';
import { LinearProgress } from '@mui/material';

import Reminders from './components/Reminders/Reminders.component.js';
import Notes from './components/Notes/Notes.component.js';

import './App.scss';

class App extends React.Component {
  state = {
    isLoading: true
  };

  componentDidMount() {

    if (this.state.isLoading) {
      setTimeout(() => {
        this.setState({
          isLoading: false
        })
      }, 1500);
    }
  }

  displayLoadingPage = () => {
    return (
      <React.Fragment>
        <Container className="Loading">
          <Row>
            <Col xs={12} className="LoadingIcons">
              <CheckCircle size={125} />
              <Edit size={125} />
            </Col>
            <Col xs={12} >
              <LinearProgress className="LoadingBar" />
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    )
  }

  dispayNavBar = () => {
    return (
      <React.Fragment>
        <Navbar fixed="top">
          <Container>
            <Nav className="me-auto">
              <Nav.Link href="#reminders">
                &nbsp;Reminders
              </Nav.Link>
              <Nav.Link href="#notes">
                &nbsp;Notes
              </Nav.Link>
              {/* <Nav.Link href="#weather">
                &nbsp;Weather
              </Nav.Link> */}
            </Nav>
          </Container>
        </Navbar>
      </React.Fragment>
    )
  }

  render() {
    let { isLoading } = this.state;

    return (
      <div className='App'>
        {isLoading &&
          <div>
            {this.displayLoadingPage()}
          </div>
        }
        {!isLoading && this.dispayNavBar()}
        {!isLoading &&
          <>
            <Route exact path="/">
              <Reminders />
            </Route>

            <Route path="/reminders">
              <Reminders />
            </Route>

            <Route path="/notes">
              <Notes />
            </Route>
          </>
        }
      </div>
    );
  }
}



export default App;
