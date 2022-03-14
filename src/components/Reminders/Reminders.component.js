import React from 'react';

import { SideBar, SelectedList, ListModal, ReminderModal, AllList } from './Reminders.support.js'
import './Reminders.scss';

const colorsList = require('../../static/assets/data/colors.json');
const months = require('../../static/assets/data/months.json');
const defaultAllLists = require('../../static/assets/data/allLists.json');

class Reminders extends React.Component {
    state = {
        allLists: [],
        todayList: {
            name: "Today",
            color: "green",
            items: []
        },
        allList: {
            name: "All",
            color: "green",
            items: []
        },

        showAddList: false,
        showEditList: false,
        list: {
            name: "",
            color: ""
        },
        currList: {
            name: "",
            color: "",
            showComplete: true,
            items: []
        },
        listValid: false,
        deleteList: {
            showWarning: false,
            confirm: false
        },

        showAddReminder: false,
        showEditReminder: false,
        reminder: {
            title: "",
            date: "",
            notes: "",
            status: false,
            id: ""
        },
        containsDate: false,
        reminderValid: false,

        errors: {
            listName: false,
            listColor: false,
            reminderTitle: false,
            reminderDate: false
        },
        displayAllList: false,
        showSideBar: false
    };

    componentDidMount() {
        let todos = JSON.parse(localStorage.getItem('todos'));
        let currList = JSON.parse(localStorage.getItem('currList'));
        let currAllLists;

        if (todos === null && this.state.allLists.length <= 0) {
            currAllLists = this.constructDefaultAllLists();
        } else {
            currAllLists = todos;
        }

        this.setState({
            allLists: currAllLists,
            displayAllList: (currList !== null && currList.name === "All") ? true : false
        }, () => {
            this.construstTodayList();

            this.setState({
                currList: currList === null ? this.state.allLists.length > 0 ? this.state.allLists[0] : {} : currList,
                showSideBar: window.innerWidth > 767 ? true : false
            });
        })

        if (typeof window !== "undefined") {
            window.addEventListener("resize", this.getWindowWidth);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.getWindowWidth);
    }

    constructDefaultAllLists = () => {
        let allLists = defaultAllLists;
        allLists.forEach(list => {
            list.items.forEach(reminder => {
                if (reminder.date === "today") {
                    reminder.date = this.getCurrentDay();
                }
            })
        })

        return allLists;
    }

    construstTodayList = () => {
        const { allLists, currList } = this.state;

        const currDay = this.getCurrentDay();
        let todayItems = [];

        allLists.forEach(list => {
            list.items.forEach(reminder => {
                if (reminder.date !== "") {
                    let reminderDate = new Date(reminder.date);
                    if (reminderDate.toString() === currDay.toString()) {
                        reminder.parent = list.name;
                        todayItems.push(reminder);
                    };
                }
            })
        });

        this.setState({
            todayList: {
                ...this.state.todayList,
                items: todayItems
            }
        }, () => {
            if (currList.name === "Today") {
                this.setState({
                    currList: this.state.todayList
                })
            }
        })
    }

    updateLocalStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getWindowWidth = () => {
        this.setState({
            showSideBar: window.innerWidth > 767 ? true : false
        });
    }

    //** EVENTS */
    handleReturnToListsButton = () => {
        this.setState({
            showSideBar: true
        })
    };

    updateList = (name) => {
        const { currList, allLists, todayList, allList } = this.state;

        let newCurrList = Object.assign({}, currList);
        if (name === "Today") {
            newCurrList = Object.assign({}, todayList);
        } else if (name === "All") {
            newCurrList = Object.assign({}, allList);
        } else {
            for (let i in allLists) {
                const list = allLists[i];
                if (name === list.name) {
                    newCurrList = Object.assign({}, list);
                    break;
                };
            };
        };
        this.updateLocalStorage('currList', newCurrList);
        this.setState({
            currList: newCurrList,
            displayAllList: name === "All" ? true : false,
            showSideBar: window.innerWidth > 767 ? true : false
        });
    };

    handleReminderCheckbox = (id) => {
        let { allLists } = this.state;
        let idFound = false;
        allLists.forEach(list => {
            for (let itemPos in list.items) {
                let item = list.items[itemPos];
                if (item.id === id) {
                    item.status = !item.status;
                    idFound = true;
                    break;
                };
            };
        });

        if (idFound) {
            this.setState({
                allLists: allLists
            }, () => {
                this.updateLocalStorage('todos', this.state.allLists);
            })
        }
    };

    handleCompletedClick = (listName) => {
        let { allLists, currList } = this.state;

        let list = Object.assign({}, currList);
        if (currList.name !== "All") {
            this.setState((prevState) => ({
                currList: {
                    ...this.state.currList,
                    showComplete: !prevState.currList.showComplete
                }
            }), () => {
                let listPos = -1;
                for (let listPosition in allLists) {
                    if (allLists[listPosition].name === currList.name) {
                        listPos = listPosition;
                        break;
                    };
                };
                if (listPos > -1) {
                    allLists[listPos] = this.state.currList;
                    list = Object.assign({}, this.state.currList);
                };
            })
        } else if (currList.name === "All") {
            let listPos = -1;
            for (let listPosition in allLists) {
                if (allLists[listPosition].name === listName) {
                    listPos = listPosition;
                    list = Object.assign({}, allLists[listPosition]);
                    list.showComplete = !allLists[listPosition].showComplete;
                    break;
                };
            };
            if (listPos > -1) {
                allLists[listPos] = list;
            };
        }
        this.setState({
            allLists: allLists
        }, () => {
            this.updateLocalStorage('todos', this.state.allLists);
            this.updateLocalStorage('currList', list);
        })
    }

    // ADD/EDIT LIST EVENTS
    handleListColorChange = (event) => {
        const { value } = event.target;
        let newColor = "";
        let isFound = false;

        for (const color in colorsList) {
            if (colorsList[color] === value) {
                newColor = color;
                isFound = true;
                break;
            };
        };

        if (isFound) {
            this.setState({
                list: {
                    ...this.state.list,
                    color: newColor
                },
            }, () => {
                this.validateList();
            });
        };
    };

    handleListNameChange = (event) => {
        const { value } = event.target;

        this.setState({
            list: {
                ...this.state.list,
                name: value
            },
        }, () => {
            this.validateList();
        });
    }

    handleListModalClose = () => {
        this.setState({
            list: {
                name: "",
                color: "",
            },
            showAddList: false,
            showEditList: false,
            errors: {
                ...this.state.errors,
                listName: false,
                listColor: false
            },
            deleteList: {
                showWarning: false
            }
        });
    };

    handleOpenListModalClick = (type) => {
        const { currList } = this.state;
        if (type === "new") {
            this.setState({
                showAddList: true
            })
        }
        else if (type === "edit") {
            this.setState({
                showEditList: true,
                list: {
                    name: currList.name,
                    color: currList.color,
                    showComplete: currList.showComplete
                }
            }, () => {
                this.validateList();
            })
        };
    };

    handleListSubmit = () => {
        const { listValid, list, showAddList, showEditList, currList, allLists } = this.state;

        if (listValid) {
            if (showAddList) {
                list.items = [];
                list.showComplete = true;
                allLists.push(list);
                this.setState({
                    allLists: allLists,
                    currList: list,
                    showSideBar: window.innerWidth > 767 ? true : false,
                    displayAllList: false
                }, () => {
                    this.handleListModalClose();
                    this.updateLocalStorage('todos', this.state.allLists);
                    this.updateLocalStorage('currList', list);
                });
            } else if (showEditList) {
                const currItems = [...currList.items];
                list.items = currItems;

                let listPos = -1;
                for (let listPosition in allLists) {
                    if (allLists[listPosition].name === currList.name) {
                        listPos = listPosition;
                        break;
                    };
                };
                if (listPos > -1) {
                    allLists[listPos] = list;
                    this.setState({
                        allLists: allLists,
                        currList: list
                    }, () => {
                        this.handleListModalClose();
                        this.updateLocalStorage('todos', this.state.allLists);
                        this.updateLocalStorage('currList', list);
                    });
                };
            }
        } else {
            this.getListErrors();
        }
    };

    handleListDeleteClick = () => {
        let { allLists, currList, deleteList } = this.state;

        if (!(deleteList.showWarning)) {
            this.setState({
                deleteList: {
                    ...this.state.deleteList,
                    showWarning: true
                }
            })
        } else if (deleteList.showWarning) {
            let newAllLists = allLists.filter(list => list.name !== currList.name);
            this.setState({
                allLists: newAllLists
            }, () => {
                this.setState({
                    currList: this.state.allLists.length > 0 ? this.state.allLists[0] : {}
                });
                this.handleListModalClose();
                this.updateLocalStorage('todos', this.state.allLists);
                this.updateLocalStorage('currList', this.state.allLists.length > 0 ? this.state.allLists[0] : {});
            })
        }
    };

    validateList = () => {
        const { name, color } = this.state.list;

        if (name && name !== null && name !== "" &&
            color && color !== null && color !== "") {
            this.setState({
                listValid: true
            });
        } else {
            this.setState({
                listValid: false
            });
        }
    };

    getListErrors = () => {
        const { name, color } = this.state.list;
        let listNameError = false;
        let listColorError = false;

        if (!(name && name !== null && name !== ""))
            listNameError = true;
        if (!(color && color !== null && color !== ""))
            listColorError = true;

        this.setState({
            errors: {
                ...this.state.errors,
                listName: listNameError,
                listColor: listColorError
            }
        });
    };

    // ADD/EDIT REMINDER EVENTS
    handleReminderChange = (event) => {
        const { value, name } = event.target;
        this.setState({
            reminder: {
                ...this.state.reminder,
                [name]: value
            }
        }, () => {
            this.validateReminder();
        })
    }

    handleReminderDateChange = (newDate) => {
        if (newDate) {
            const day = newDate.getDate();
            const month = newDate.getMonth() + 1;
            const year = newDate.getFullYear();

            let monthInString;
            if (month < 10)
                monthInString = `0${month}`;
            else
                monthInString = `${month}`;

            const chosenDate = `${year}/${monthInString}/${day}`;
            this.setState({
                reminder: {
                    ...this.state.reminder,
                    date: chosenDate
                }
            }, () => {
                this.validateReminder();
            });
        }
    };

    handleReminderDateSwitch = () => {
        this.setState((prevState) => ({
            containsDate: !prevState.containsDate,
            reminder: {
                ...this.state.reminder,
                date: ""
            }
        }), () => {
            this.validateReminder();
        });
    };

    handleOpenReminderModalClick = (type, currReminder, listName) => {
        console.log(new Date(this.getCurrentDay()));
        if (type === "new") {
            this.setState({
                showAddReminder: true,
                reminder: {
                    ...this.state.reminder,
                    parent: listName === "Today" ? "Reminders" : listName,
                    date: listName === "Today" ? this.getCurrentDay() : "",
                },
                containsDate: listName === "Today" ? true : false
            });
        }
        else if (type === "edit") {
            this.setState({
                showEditReminder: true,
                reminder: {
                    ...currReminder,
                    parent: listName === "Today" ? "Reminders" : listName
                },
                containsDate: currReminder.date !== ""
            }, () => {
                this.validateReminder();
            });
        }
    };

    handleReminderModalClose = () => {
        this.setState({
            reminder: {
                reminder: "",
                date: "",
                notes: "",
                status: false,
                id: ""
            },
            showAddReminder: false,
            showEditReminder: false,
            containsDate: false,
            errors: {
                ...this.state.errors,
                reminderTitle: false,
                reminderDate: false
            }
        })
    };

    validateReminder = () => {
        const { title, date } = this.state.reminder;
        const { containsDate } = this.state;

        if (title && title !== null && title !== "") {
            if (containsDate) {
                if (date && date !== null && date !== "") {
                    this.setState({
                        reminderValid: true
                    });
                } else {
                    this.setState({
                        reminderValid: false
                    });
                }
            } else {
                this.setState({
                    reminderValid: true
                });
            }
        }
    };

    getReminderErrors = () => {
        const { title, date } = this.state.reminder;
        const { containsDate } = this.state;
        let reminderTitleErr = false;
        let reminderDateErr = false;

        if (!(title && title !== null && title !== ""))
            reminderTitleErr = true;
        if (containsDate) {
            if (!(date && date !== null && date !== "")) {
                reminderDateErr = true;
            }
        }

        this.setState({
            errors: {
                ...this.state.errors,
                reminderTitle: reminderTitleErr,
                reminderDate: reminderDateErr
            }
        });
    };

    handleReminderSubmit = () => {
        const { reminderValid, reminder, allLists, showAddReminder, showEditReminder, displayAllList } = this.state;

        let listName = reminder.parent;
        if (reminderValid) {
            if (showAddReminder) {
                let listFound = false;
                let newRemind = Object.assign({}, reminder);
                allLists.forEach(list => {
                    if (list.name === reminder.parent) {
                        listFound = true;
                        newRemind.id = `${reminder.parent}-${list.items.length}`;
                        delete newRemind.parent;
                        list.items.push(newRemind);
                        listFound = true;
                    }
                });
                if (listFound) {
                    this.setState({
                        allLists: allLists,
                    }, () => {
                        if (!displayAllList)
                            this.updateList(listName);
                        this.handleReminderModalClose();
                        this.construstTodayList();
                        this.updateLocalStorage('todos', this.state.allLists);
                    })
                }
            } else if (showEditReminder) {
                allLists.forEach(list => {
                    if (list.name === reminder.parent) {
                        for (let itemPos in list.items) {
                            if (list.items[itemPos].id === reminder.id) {
                                delete reminder.parent;
                                list.items[itemPos] = reminder;
                                break;
                            }
                        };
                        this.setState({
                            allLists: allLists,
                        }, () => {
                            if (!displayAllList)
                                this.updateList(listName);
                            this.handleReminderModalClose();
                            this.construstTodayList();
                            this.updateLocalStorage('todos', this.state.allLists);
                        });
                    }
                });
            }
        } else {
            this.getReminderErrors();
        }
    };

    handleReminderDeleteClick = (currReminder, listName) => {
        let { allLists, displayAllList } = this.state;
        let newCurrList;

        let parentListName = listName === "Today" ? currReminder.parent : listName;
        let currList = {};
        for (let listPos in allLists) {
            if (allLists[listPos].name === parentListName) {
                currList = Object.assign({}, allLists[listPos]);
                let newCurrListItems = currList.items.filter(reminder => reminder.title !== currReminder.title);
                currList.items = [...newCurrListItems];
                allLists[listPos] = currList;
                newCurrList = Object.assign({}, currList);
            }
        }

        this.setState({
            allLists: allLists,
        }, () => {
            this.construstTodayList();
            this.updateLocalStorage('todos', this.state.allLists);
            if (!displayAllList)
                this.updateLocalStorage('currList', newCurrList);
            if (!displayAllList && listName !== "Today")
                this.updateList(listName);
        });
    };

    formatDate = (date) => {
        const newDate = new Date(date);
        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const year = newDate.getFullYear();

        let monthInString;
        if (month < 10)
            monthInString = `0${month}`;
        else
            monthInString = `${month}`;

        const monthInWord = months[monthInString];

        return `${monthInWord} ${day}, ${year}`;
    };

    isReminderOverdue = (date) => {
        const newDate = new Date(date);
        const currDay = this.getCurrentDay();

        return (newDate < currDay);
    }

    getCurrentDay = () => {
        const currTime = new Date();
        const currDate = new Date(`${currTime.getFullYear()}/${currTime.getMonth() + 1}/${currTime.getDate()}`);
        return currDate;
    };

    render() {
        let {
            currList,
            todayList,
            allList,
            allLists,
            showAddList,
            showEditList,
            list,
            deleteList,
            errors,
            showAddReminder,
            showEditReminder,
            reminder,
            containsDate,
            displayAllList,
            showSideBar
        } = this.state;

        return (
            <div className="Reminders">
                <SideBar
                    currList={currList}
                    todayList={todayList}
                    allList={allList}
                    allLists={allLists}
                    updateList={this.updateList}
                    handleOpenListModalClick={this.handleOpenListModalClick}
                    show={showSideBar}
                />
                <main>
                    {allLists.length > 0 && !displayAllList &&
                        <SelectedList
                            currList={currList}
                            showSideBar={showSideBar}
                            handleReminderCheckbox={this.handleReminderCheckbox}
                            formatDate={this.formatDate}
                            isReminderOverdue={this.isReminderOverdue}
                            handleOpenReminderModalClick={this.handleOpenReminderModalClick}
                            handleOpenListModalClick={this.handleOpenListModalClick}
                            handleReminderDeleteClick={this.handleReminderDeleteClick}
                            handleCompletedClick={this.handleCompletedClick}
                            handleReturnToListsButton={this.handleReturnToListsButton}
                        />
                    }
                    {displayAllList &&
                        <AllList
                            allLists={allLists}
                            showSideBar={showSideBar}
                            handleReminderCheckbox={this.handleReminderCheckbox}
                            formatDate={this.formatDate}
                            isReminderOverdue={this.isReminderOverdue}
                            handleOpenReminderModalClick={this.handleOpenReminderModalClick}
                            handleOpenListModalClick={this.handleOpenListModalClick}
                            handleReminderDeleteClick={this.handleReminderDeleteClick}
                            handleCompletedClick={this.handleCompletedClick}
                            handleReturnToListsButton={this.handleReturnToListsButton}
                        />
                    }
                </main>
                <ListModal
                    showAddList={showAddList}
                    showEditList={showEditList}
                    list={list}
                    errors={errors}
                    handleListModalClose={this.handleListModalClose}
                    handleListNameChange={this.handleListNameChange}
                    handleListColorChange={this.handleListColorChange}
                    handleListDeleteClick={this.handleListDeleteClick}
                    handleListSubmit={this.handleListSubmit}
                    showWarning={deleteList.showWarning}
                />
                <ReminderModal
                    showAddReminder={showAddReminder}
                    showEditReminder={showEditReminder}
                    reminder={reminder}
                    handleReminderChange={this.handleReminderChange}
                    handleReminderDateChange={this.handleReminderDateChange}
                    handleReminderDateSwitch={this.handleReminderDateSwitch}
                    containsDate={containsDate}
                    errors={errors}
                    handleReminderModalClose={this.handleReminderModalClose}
                    handleReminderSubmit={this.handleReminderSubmit}
                />
            </div>
        )
    }
}

export default Reminders;
