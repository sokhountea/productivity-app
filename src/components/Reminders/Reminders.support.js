import React from 'react';
import { Container, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { PlusCircle, List, Plus, Info, Edit2, Trash2, ChevronRight, ChevronLeft } from 'react-feather';
import { LocalizationProvider, DesktopDatePicker } from '@mui/lab';
import { TextField, Switch } from '@mui/material';
import DateAdapter from '@mui/lab/AdapterDateFns';

import './Reminders.scss';

const colorsList = require('../../static/assets/data/colors.json');

export const SideBar = ({
    currList,
    todayList,
    allLists,
    updateList,
    handleOpenListModalClick,
    show
}) => {
    let allListsCount = 0;
    allLists.forEach(list => {
        allListsCount += (list.items.filter(item => item.status === false)).length;
    })
    return (
        <React.Fragment>
            {show && <Container className="SideBar">
                <Row className="SideBarOptions">
                    <Col
                        xs={6}
                        className={`SideBarOption ${currList.name === "Today" ? "selected" : ""}`}
                        onClick={() => updateList("Today")}
                    >
                        <p>Today</p>
                        <p className="SideBarOptionCount" >
                            {todayList.items.filter(reminder => reminder.status === false).length}
                        </p>
                    </Col>
                    <Col
                        xs={6}
                        className={`SideBarOption ${currList.name === "All" ? "selected" : ""}`}
                        onClick={() => updateList("All")}
                    >
                        <p>All</p>
                        <p className="SideBarOptionCount" >{allListsCount}</p>
                    </Col>
                </Row>
                <Row className="SideBarLists">
                    <h1>My Lists</h1>
                    {allLists.length > 0 &&
                        <AllLists
                            currList={currList}
                            allLists={allLists}
                            updateList={updateList}
                        />
                    }
                </Row>
                <Row className="SideBarAddListButton">
                    <Col xs={12} >
                        <Button
                            className="addButton"
                            onClick={() => handleOpenListModalClick("new")}
                        >
                            <PlusCircle size={18} /> Add List
                        </Button>
                    </Col>
                </Row>
            </Container>
            }
        </React.Fragment >
    )
};

export const ListOfColors = ({
    list,
    handleListColorChange
}) => {
    let allColors = [];
    for (const color in colorsList) {
        allColors.push(colorsList[color]);
    };
    // remove green color
    // green is only avail for today and all lists
    allColors.pop();

    return (
        <React.Fragment>
            <span className="allColorsContainer">
                {allColors.map((color, i) => {
                    return (
                        <div
                            key={`${color}`}
                            className="colorContainer"
                        >
                            <input
                                type="radio"
                                aria-label="radio 1"
                                id={`${color}`}
                                value={`${color}`}
                                className="form-check-input"
                                style={{ backgroundColor: `${color}` }}
                                checked={colorsList[list.color] === color}
                                onChange={handleListColorChange}
                            />
                        </div>
                    )
                })}
            </span>
        </React.Fragment>
    )
};

export const AllLists = ({
    currList,
    allLists,
    updateList
}) => {
    return (
        <React.Fragment>
            <ul>
                {allLists.map((listInfo, i) => {
                    return (
                        <li
                            key={i}
                        >
                            <span
                                className={`ListInfoContainer ${currList.name === listInfo.name ? "selected" : ""}`}
                                onClick={() => updateList(listInfo.name)}
                            >
                                <span>
                                    <span
                                        className="IconContainer"
                                        style={{ backgroundColor: `${colorsList[listInfo.color]}` }}
                                    >
                                        <List size={16} />
                                    </span>
                                    {`${listInfo.name}`}
                                </span>
                                <span className="CountContainer">
                                    {(listInfo.items.filter(item => item.status === false)).length}
                                    &nbsp;
                                    <ChevronRight className="mobile" size={15} />
                                </span>
                            </span>
                            {!(i === (allLists.length - 1)) &&
                                <hr>
                                </hr>
                            }
                        </li>);
                })}
            </ul>
        </React.Fragment >
    )
};

export const SelectedList = ({
    currList,
    showSideBar,
    handleReminderCheckbox,
    formatDate,
    isReminderOverdue,
    handleOpenReminderModalClick,
    handleOpenListModalClick,
    handleReminderDeleteClick,
    handleCompletedClick,
    handleReturnToListsButton,
    isChildren = false
}) => {
    return (
        <React.Fragment>
            {(!isChildren && !showSideBar) &&
                <Row className="ReturnLists mobile">
                    <Col xs={12}
                        onClick={() => handleReturnToListsButton()}
                    >
                        <span
                            className="ReturnListsButton"
                        >
                            <ChevronLeft size={20} /> Lists
                        </span>
                    </Col>
                </Row>
            }
            <Container className="MainContent">
                <Row className="MainContentHeader">
                    <Col
                        xs={6}
                        className="MainContentName"
                        style={{ color: `${colorsList[currList.color]}` }}
                    >
                        {currList.name}
                    </Col>
                    <Col xs={6} className="MainContentPlusIcon">
                        <span>
                            {(currList.name !== "Today" &&
                                currList.name !== "All" &&
                                !isChildren) &&
                                <Edit2
                                    size={20}
                                    onClick={() => handleOpenListModalClick("edit")}
                                />
                            }
                            &nbsp;
                            <Plus size={25}
                                onClick={() => handleOpenReminderModalClick("new", null, currList.name)}
                            />
                        </span>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} className="MainContentCompleteLink">
                        <span onClick={() => handleCompletedClick(currList.name)}>
                            {currList.showComplete ?
                                `Hide completed`
                                :
                                `Show completed`
                            }
                        </span>
                    </Col>
                </Row>
                <ListItems
                    list={currList}
                    handleReminderCheckbox={handleReminderCheckbox}
                    formatDate={formatDate}
                    isReminderOverdue={isReminderOverdue}
                    handleOpenReminderModalClick={handleOpenReminderModalClick}
                    handleReminderDeleteClick={handleReminderDeleteClick}
                />
            </Container>
        </React.Fragment >
    )
};

export const ListItems = ({
    list,
    handleReminderCheckbox,
    formatDate,
    isReminderOverdue,
    handleOpenReminderModalClick,
    handleReminderDeleteClick
}) => {
    return (
        <React.Fragment>
            {list.items.map((item, i) => {
                return (
                    <span key={`${item.title}-${i}`}>
                        {((list.showComplete) || (!list.showComplete && !item.status)) &&
                            <Row className="ListItem"
                            >
                                <Col xs={1}>
                                    <span
                                        className="ListItemCheckbox"
                                        style={{ backgroundColor: `${item.status === false ? "transparent" : colorsList[list.color]}` }}
                                        onClick={() => handleReminderCheckbox(item.id)}
                                    ></span>
                                </Col>
                                <Col
                                    xs={10}
                                    className="ListItemInfo"
                                >
                                    <div>
                                        {item.title}
                                    </div>
                                    {item.date !== "" ?
                                        (<div className={`ListItemInfoDate ${isReminderOverdue(item.date) ? "overdue" : ""}`}>
                                            {formatDate(item.date)}
                                        </div>)
                                        :
                                        <div className="ListItemInfoDate">&nbsp;</div>
                                    }
                                </Col>
                                <Col xs={1} className="ListItemIcons">
                                    <Info
                                        size={17}
                                        color={`${colorsList[list.color]}`}
                                        onClick={() => handleOpenReminderModalClick("edit", item, list.name)}
                                    />
                                    <Trash2
                                        size={17}
                                        color={`${colorsList[list.color]}`}
                                        onClick={() => handleReminderDeleteClick(item, list.name)} />
                                </Col>
                            </Row>
                        }
                    </span>
                )
            })}
        </React.Fragment>
    )
};

export const ListModal = ({
    showAddList,
    showEditList,
    list,
    errors,
    handleListModalClose,
    handleListNameChange,
    handleListColorChange,
    handleListDeleteClick,
    handleListSubmit,
    showWarning
}) => {
    return (
        <React.Fragment>
            <Modal
                show={showAddList || showEditList}
                onHide={() => handleListModalClose()}
                className="addListModal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showAddList && <span>New List</span>}
                        {showEditList && <span>Edit List</span>}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formListName">
                            <Form.Label className={errors.listName && "error"}>
                                Name
                            </Form.Label>
                            <Form.Control
                                type="name"
                                defaultValue={list.name}
                                onChange={handleListNameChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formListColor">
                            <Form.Label className={errors.listColor && "error"}>
                                Color
                            </Form.Label>
                            <ListOfColors
                                list={list}
                                handleListColorChange={handleListColorChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {showWarning &&
                        <Alert variant="danger">
                            Are you sure you want to delete this list?
                        </Alert>
                    }
                    <div className="ListModalFooterButtons">
                        <span>
                            {showEditList &&
                                <Button variant="danger"
                                    onClick={() => handleListDeleteClick()}>
                                    {showWarning ?
                                        `Yes`
                                        :
                                        `Delete List`
                                    }
                                </Button>
                            }
                        </span>
                        <span>
                            <Button variant="secondary"
                                onClick={() => handleListModalClose()}
                            >
                                Cancel
                            </Button>
                            &nbsp;
                            <Button variant="primary"
                                className="primaryButton"
                                onClick={() => handleListSubmit()}
                            >
                                {showAddList ?
                                    (`OK`)
                                    :
                                    (`Save`)
                                }
                            </Button>
                        </span>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
};

export const ReminderModal = ({
    showAddReminder,
    showEditReminder,
    reminder,
    handleReminderChange,
    handleReminderDateChange,
    handleReminderDateSwitch,
    containsDate,
    handleReminderModalClose,
    handleReminderSubmit,
    errors
}) => {
    return (
        <React.Fragment>
            <Modal
                show={showAddReminder || showEditReminder}
                onHide={() => handleReminderModalClose()}
                className="addReminderModal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showAddReminder && `New Reminder`}
                        {showEditReminder && `Edit Reminder`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formReminderTitle">
                            <Form.Label className={errors.reminderTitle && "error"}>
                                Title
                            </Form.Label>
                            <Form.Control
                                name="title"
                                defaultValue={reminder.title}
                                onChange={handleReminderChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formReminderNotes">
                            <Form.Label>
                                Notes
                            </Form.Label>
                            <Form.Control
                                name="notes"
                                as="textarea"
                                style={{ height: '100px' }}
                                value={reminder.notes}
                                onChange={handleReminderChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3 reminderDateContainer" controlId="formReminderDate">
                            <Form.Label className={errors.reminderDate && "error"}>
                                Date
                                <Switch
                                    className="dateSwitch"
                                    checked={containsDate}
                                    onChange={handleReminderDateSwitch}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                            </Form.Label>
                            <div>
                                <LocalizationProvider dateAdapter={DateAdapter}>
                                    <DesktopDatePicker
                                        label=""
                                        inputFormat="yyyy/MM/dd"
                                        value={reminder.date}
                                        onChange={handleReminderDateChange}
                                        renderInput={(params) => <TextField {...params} />}
                                        disabled={!containsDate}
                                    />
                                </LocalizationProvider>
                            </div>
                        </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary"
                        onClick={() => handleReminderModalClose()}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary"
                        className="primaryButton"
                        onClick={() => handleReminderSubmit()}
                    >
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
};

export const AllList = ({
    allLists,
    showSideBar,
    handleReminderCheckbox,
    formatDate,
    isReminderOverdue,
    handleOpenReminderModalClick,
    handleOpenListModalClick,
    handleReminderDeleteClick,
    handleCompletedClick,
    handleReturnToListsButton
}) => {
    return (
        <React.Fragment>
            {!showSideBar &&
                <Row className="ReturnLists mobile">
                    <Col xs={12}>
                        <span
                            className="ReturnListsButton"
                            onClick={() => handleReturnToListsButton()}
                        >
                            <ChevronLeft size={20} /> Lists
                        </span>
                    </Col>
                </Row>
            }
            <Container className="AllMainContent">
                <Row className="AllMainContentHeader">
                    <Col
                        xs={6}
                        className="AllMainContentName"
                        style={{ color: `${colorsList[`green`]}` }}
                    >
                        All
                    </Col>
                </Row>
                {allLists.map((listInfo, i) => {
                    return (
                        <SelectedList
                            key={`${listInfo.name}-${i}`}
                            currList={listInfo}
                            handleReminderCheckbox={handleReminderCheckbox}
                            formatDate={formatDate}
                            isReminderOverdue={isReminderOverdue}
                            handleOpenReminderModalClick={handleOpenReminderModalClick}
                            handleOpenListModalClick={handleOpenListModalClick}
                            handleReminderDeleteClick={handleReminderDeleteClick}
                            handleCompletedClick={handleCompletedClick}
                            handleReturnToListsButton={handleReturnToListsButton}
                            isChildren={true}
                        />
                    )
                })}
            </Container>
        </React.Fragment>
    )
}