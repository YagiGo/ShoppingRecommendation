import React from 'react';
import ReactDOM from 'react-dom';
import validUrl from 'valid-url';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Alert} from"react-bootstrap";
import {Button, Navbar, Jumbotron, PageHeader, Modal} from "react-bootstrap";
import {FormGroup, ControlLabel, FormControl, ListGroup, ListGroupItem} from "react-bootstrap"

class Header extends React.Component {
    render() {
        return (
            <Navbar inverse collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a>Shopping Recommendation</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
            </Navbar>
        )
    }
}

class Introduction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            serverFinished: true,
            showResult: false,
            inputURL: "",
            data: [],
            originalURL: ""};
        this.tryButtonClicked = this.tryButtonClicked.bind(this);
        this.cacelButtonClicked = this.cacelButtonClicked.bind(this);
        this.sendURLBack = this.sendURLBack.bind(this);
        this.handleInput = this.handleInput.bind(this)
    }

    tryButtonClicked() {
        // Clean the previous search result
        // open modal
        // stop showing result

        this.setState(
            {
                showModal: true,
                originalURL: "",
                data: [],
                showResult: false
            })

    }

    cacelButtonClicked() {
        this.setState({showModal: false});
        this.setState(
            {
                data: [],
                originalURL: ""
        });
    }

    handleInput(e) {
        this.setState({inputURL: e.target.value})
    }

    validateURL() {
        if(validUrl.is_uri(this.state.inputURL)) {
            return "success"
        }
        else {
            return "error";
        }
    }

    sendURLBack() {
        if(this.validateURL() === "error")
        {alert("Invalid URL! Check your input!")}
        else
        {

            fetch('http://localhost:8081/api/urlToBeAnalyzed',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        "Access-Control-Allow-Methods":"POST" // Cross Site
                    },
                    body: JSON.stringify({
                        urlToBeAnalyzed: this.state.inputURL
                    })
                })
                .then((res) => {
                    console.log("Search Finished!");
                    this.setState({serverFinished: true});
                    return res.json();
                })
                .then(data => {
                    console.log(data);
                    this.setState({data: this.state.data.concat([data["url0"]])});
                    this.setState({data: this.state.data.concat([data["url1"]])});
                    this.setState({data: this.state.data.concat([data["url2"]])});
                    this.setState({originalURL: data["digest"]});
                    // console.log(this.state.data);
                    // console.log(this.state.originalURL);
                    console.log(this.state.showResult);
                    this.setState({showModal: false, showResult: true});
                });
            this.setState({serverFinished: false});
        }

        // setTimeout(() => {
        //     // Pretending the server is processing
        //     // Add future backend code here
        //     this.setState({serverFinished: true});
        //     //Close Modal
        //     console.log("WILL SEND: ", this.state.inputURL); //Send the URL BACK TO SERVER
        //     this.cacelButtonClicked();
        // }, 2000);
    }



    render() {
        return (
            <Jumbotron show={this.state.serverFinished}>
                <PageHeader> Want more products like you've searched?</PageHeader>
                <p>This site recommends similar products from amazon based on the product information you type in.</p>\
                <div>
                    <Button bsSize="large" bsStyle="primary" onClick={this.tryButtonClicked}>
                        Search
                    </Button>
                    <Modal show={this.state.showModal} onHide={this.handleInteract}>
                        <Modal.Header>
                            <Modal.Title>検索したい商品のURLを入力してください</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form>
                                <FormGroup
                                    validationState={this.validateURL()}>
                                    <ControlLabel>商品URL</ControlLabel>
                                    <FormControl
                                        type="url"
                                        value={this.state.inputURL}
                                        plcaeholder="https://example.com"
                                        onChange={this.handleInput}
                                    />
                                    <FormControl.Feedback />
                                </FormGroup>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                type="submit"
                                disabled={!this.state.serverFinished}
                                onClick={this.state.serverFinished ? this.sendURLBack: null}>
                                {this.state.serverFinished ?  " 検索" : "検索中"}
                            </Button>
                            <Button onClick={this.cacelButtonClicked}>キャンセル</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <br></br>
                <br></br>
                <div>
                    {
                        this.state.showResult ?
                        <ListGroup>
                            {<ListGroupItem key={this.state.originalURL} href={this.state.originalURL}>Searched Product: {this.state.originalURL}</ListGroupItem>}
                            {
                                this.state.data.map((item,index) => {
                                    return <ListGroupItem key={index} href={item}>Recommended Product: {item}</ListGroupItem>
                                })


                            }
                        </ListGroup> : null
                    }

                </div>

            </Jumbotron>


        )
    }
}


class Layout extends React.Component {
    render() {
       return (
           <div className="body">
               <div className="nav-bar">
                   <Header />
               </div>
               <div className="intro">
                   <Introduction />
               </div>
           </div>

       )
    }
}

ReactDOM.render(<Layout />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
