import React from 'react';

import { AllNotes, Note, AddNoteButton, DeleteModal } from './Notes.support.js'
import dompurify from 'dompurify';

import './Notes.scss';

const months = require('../../static/assets/data/months.json');
const defaultAllNotes = require('../../static/assets/data/allNotes.json');
const sanitizer = dompurify.sanitize;

class Notes extends React.Component {
    state = {
        notes: [],
        note: {
            title: "",
            date: "",
            text: "",
            id: ""
        },
        displayAllNotes: true,
        showDeleteModal: false
    };

    componentDidMount() {
        let notes = JSON.parse(localStorage.getItem('notes'));
        let currNote = JSON.parse(localStorage.getItem('currNote'));
        let currNotes;

        if (notes === null && this.state.notes.length <= 0) {
            currNotes = defaultAllNotes;
        } else {
            currNotes = notes;
        }

        if (currNote !== null && currNote && currNote.id !== "") {
            for (let pos in currNotes) {
                // in case they updated a note before closing browsing and not returning to menu (hence not saving it)
                if (currNotes[pos] === currNote.id) {
                    currNotes[pos] = currNote;
                }
            }
        }

        this.setState({
            notes: currNotes,
            displayAllNotes: (currNote === null || (currNote && currNote.id === "")) ? true : false,
        }, () => {
            this.sortNotesByDate();
            if (!this.state.displayAllNotes) {
                this.setState({
                    note: currNote
                })
            }
        });
    }

    updateLocalStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    }

    sortNotesByDate = () => {
        let { notes } = this.state;
        notes.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        this.setState({
            notes: notes
        }, () => {
            setTimeout(() => {
                this.setNotesTitle();
            }, 100);
        });
    };

    setNotesTitle = () => {
        let { notes } = this.state;
        for (let pos in notes) {
            let title = this.extractFirstTitle(pos);
            notes[pos].title = title ? title : "New Note";
        };

        this.setState({
            notes: notes
        }, () => {
            this.updateLocalStorage('notes', this.state.notes);
            this.updateLocalStorage('currNote', this.state.note);
        });
    }

    extractFirstTitle = (index) => {
        if (document.readyState === "complete") {
            let allNotesText = document.getElementsByClassName("SingleNoteThumbnailText");
            if (allNotesText.length > 0) {
                let currNote = allNotesText[index];
                let el = currNote.firstElementChild;
                if (currNote.innerHTML && el == null) {
                    return currNote.innerHTML;
                } else {
                    let el = currNote.firstElementChild;
                    let j = 0;
                    while (el && el !== null && el.childElementCount !== 0 && j < 5) {
                        el = el.firstElementChild;
                        j++;
                    }
                    return el.innerHTML;
                }
            }
        }
    }

    formatDateWithTime = (date) => {
        const newDate = new Date(date);

        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const year = newDate.getFullYear();
        const time = newDate.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });

        let monthInString;
        if (month < 10)
            monthInString = `0${month}`;
        else
            monthInString = `${month}`;

        const monthInWord = months[monthInString];

        return `${monthInWord} ${day}, ${year} at ${time}`;
    }

    formatDate = (date) => {
        const newDate = new Date(date);
        const currDay = this.getCurrentDay();

        if (newDate.getMonth() + 1 === currDay.getMonth() + 1 &&
            newDate.getDate() === currDay.getDate() &&
            newDate.getFullYear() === currDay.getFullYear()
        ) {
            let time = newDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
            });
            return time;
        } else {
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
        }
    }

    getCurrentDay = () => {
        const currTime = new Date();
        const currDate = new Date(`${currTime.getFullYear()}/${currTime.getMonth() + 1}/${currTime.getDate()}`);
        return currDate;
    };

    // EVENTS
    handleNoteThumbnailClick = (id) => {
        const { notes } = this.state;
        let isFound = false;
        let note = null;
        notes.forEach(singleNote => {
            if (singleNote.id === id) {
                isFound = true;
                note = Object.assign({}, singleNote);
            }
        });
        if (isFound) {
            this.setState({
                note: note,
                displayAllNotes: false
            }, () => {
                this.updateLocalStorage('currNote', this.state.note);
            })
        }
    };

    handleNoteXClick = () => {
        let { notes, note } = this.state;

        let isFound = false;
        for (let notePos in notes) {
            if (notes[notePos].id === note.id) {
                isFound = true;
                notes[notePos] = note;
            }
        }

        if (isFound) {
            this.setState({
                notes: notes,
                displayAllNotes: true,
                note: {
                    title: "",
                    date: "",
                    text: "",
                    id: ""
                },
                showDeleteModal: false
            }, () => {
                this.sortNotesByDate();
            })
        }
    };

    handleContentEditableChange = (event) => {
        let { value } = event.target;

        let today = new Date();
        let date = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

        this.setState({
            note: {
                ...this.state.note,
                text: sanitizer(`${value}`),
                date: date
            }
        }, () => {
            this.updateLocalStorage("currNote", this.state.note);
        });
    };

    handleAddNoteClick = () => {
        let { notes } = this.state;

        const today = new Date();
        let date = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

        let id = `notes-${notes.length}`;

        let newNote = {
            title: "",
            date: date,
            text: "",
            id: id
        };

        notes.push(newNote);

        this.setState({
            notes: notes,
            note: newNote,
            displayAllNotes: false
        }, () => {
            this.sortNotesByDate();
        });
    };

    onMouseDown = (event) => {
        event.preventDefault();
        let cmd = event.target.getAttribute('cmd');
        let arg = event.target.getAttribute('arg');

        if (document.readyState === "complete") {
            document.execCommand(cmd, false, arg ? arg : "");
        }
    };

    handleDeleteNoteClick = () => {
        this.setState({
            showDeleteModal: true
        });
    };

    handleDeleteModalClose = () => {
        this.setState({
            showDeleteModal: false
        });
    };

    handleConfirmClick = (id) => {
        let { notes } = this.state;
        let newNotes = notes.filter(note => note.id !== id);
        this.setState({
            notes: newNotes,
            displayAllNotes: true,
            note: {
                title: "",
                date: "",
                text: "",
                id: ""
            }
        }, () => {
            this.updateLocalStorage('currNote', this.state.note);
            this.updateLocalStorage('notes', this.state.notes);
            this.handleDeleteModalClose();
        });
    }

    render() {
        let { notes,
            note,
            displayAllNotes,
            showDeleteModal
        } = this.state;

        return (
            <div className="Notes">
                <AllNotes
                    show={displayAllNotes}
                    notes={notes}
                    formatDate={this.formatDate}
                    handleNoteThumbnailClick={this.handleNoteThumbnailClick}
                />
                <Note
                    show={!displayAllNotes}
                    note={note}
                    handleNoteXClick={this.handleNoteXClick}
                    handleContentEditableChange={this.handleContentEditableChange}
                    onMouseDown={this.onMouseDown}
                    handleDeleteNoteClick={this.handleDeleteNoteClick}
                    formatDateWithTime={this.formatDateWithTime}
                />
                <AddNoteButton
                    handleAddNoteClick={this.handleAddNoteClick}
                />
                <DeleteModal
                    show={showDeleteModal}
                    id={note.id}
                    handleDeleteModalClose={this.handleDeleteModalClose}
                    handleConfirmClick={this.handleConfirmClick}
                />
            </div>
        )
    }
}

export default Notes;
