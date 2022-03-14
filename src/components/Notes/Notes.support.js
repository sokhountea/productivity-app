import React from 'react';
import { Container, Row, Col, Button, Alert, Modal } from 'react-bootstrap';
import { PlusCircle, Trash2, X as XIcon } from 'react-feather';
import ContentEditable from 'react-contenteditable';

import dompurify from 'dompurify';

import './Notes.scss';

export const AllNotes = ({
    show,
    notes,
    formatDate,
    handleNoteThumbnailClick
}) => {
    const sanitizer = dompurify.sanitize;

    return (
        <React.Fragment>
            {show && <Row className="AllNotes">
                {notes.map((note, i) => {
                    return (
                        <Col className="SingleNote"
                            key={i}
                        >
                            <Col xs={12}
                                className="SingleNoteThumbnail"
                                onClick={() => handleNoteThumbnailClick(note.id)}
                            >
                                <div className="SingleNoteThumbnailText"
                                    dangerouslySetInnerHTML={{ __html: sanitizer(`${note.text}`) }}>
                                </div>
                            </Col>
                            <Col xs={12}
                                className="SingleNoteTitle"
                            >
                                <div dangerouslySetInnerHTML={{ __html: sanitizer(`${note.title}`) }}>
                                </div>
                            </Col>
                            <Col xs={12}
                                className="SingleNoteDate"
                            >
                                {formatDate(note.date)}
                            </Col>
                        </Col>
                    )
                })}
            </Row>
            }
        </React.Fragment>
    )
};

export const Note = ({
    show,
    note,
    handleNoteXClick,
    handleContentEditableChange,
    onMouseDown,
    handleDeleteNoteClick,
    formatDateWithTime
}) => {
    return (
        <React.Fragment>
            {show &&
                <>
                    <Container className="FixedNote">
                        <Row>
                            <Col xs={12} className="ReturnNotes">
                                <span
                                    className="ReturnNotesButton"
                                    onClick={() => handleNoteXClick()}
                                >
                                    <XIcon size={25} />
                                </span>
                            </Col>
                        </Row>
                        <NoteButtons
                            onMouseDown={onMouseDown}
                            handleDeleteNoteClick={handleDeleteNoteClick}
                        />
                    </Container>
                    <Container className="MainContent">
                        <Row className="MainContentDate">
                            <Col xs={12}>
                                {formatDateWithTime(note.date)}
                            </Col>
                        </Row>
                        <Row className="">
                            <Content
                                html={note.text}
                                handleContentEditableChange={handleContentEditableChange}
                            />
                        </Row>
                    </Container>
                </>
            }
        </React.Fragment >

    )
};

export const NoteButtons = ({
    onMouseDown,
    handleDeleteNoteClick
}) => {
    return (
        <React.Fragment>
            <Row className="NoteButtons">
                <Col className="StylingButtons" xs={10}>
                    <Col className="StylingButton"
                        xs={4} sm={2}
                        cmd="formatBlock"
                        arg="h1"
                        onMouseDown={onMouseDown}
                    >
                        Title
                    </Col>
                    <Col className="StylingButton" xs={4} sm={2}
                        cmd="formatBlock"
                        arg="p"
                        onMouseDown={onMouseDown}
                    >
                        Body
                    </Col>
                    <Col className="StylingButton" xs={4} sm={2}
                        cmd="italic"
                        onMouseDown={onMouseDown}
                    >
                        Italic
                    </Col>
                    <Col className="StylingButton" xs={4} sm={2}
                        cmd="bold"
                        onMouseDown={onMouseDown}
                    >
                        Bold
                    </Col>
                    <Col className="StylingButton" xs={4} sm={2}
                        cmd="insertUnorderedList"
                        onMouseDown={onMouseDown}>
                        List
                    </Col>
                </Col>
                <Col className="TrashButton" xs={2}
                    onClick={() => handleDeleteNoteClick()}>
                    <Trash2 size={20} />
                </Col>
            </Row>
        </React.Fragment>
    )
};

export const Content = ({
    html,
    handleContentEditableChange
}) => {
    return (
        <React.Fragment>
            <ContentEditable
                className="ContentEditable"
                html={html}
                disabled={false}
                onChange={handleContentEditableChange}
                tagName='article'
            />
        </React.Fragment>
    )
};

export const AddNoteButton = ({
    handleAddNoteClick
}) => {
    return (
        <Row className="AddNotetButton">
            <Col xs={12} >
                <Button
                    className="addButton"
                    onClick={() => handleAddNoteClick("new")}
                >
                    <PlusCircle size={18} /> Add Note
                </Button>
            </Col>
        </Row>
    )
};

export const DeleteModal = ({
    show,
    id,
    handleDeleteModalClose,
    handleConfirmClick
}) => {
    return (
        <React.Fragment>
            <Modal
                show={show}
                onHide={() => handleDeleteModalClose()}
                className="addListModal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Delete Note
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this note?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => handleDeleteModalClose()}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="primaryButton" onClick={() => handleConfirmClick(id)}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}