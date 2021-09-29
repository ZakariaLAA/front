import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import logo from "../assets/images/NNutQdKX.png";
import "../CSS/Home2.css";
import MenuIcon from "@material-ui/icons/Menu";
import ProfileDropDown from "./ProfilDropDown";
import searchService from "../__helpers/searchService";
import Autosuggest from "react-autosuggest";
import { Link, useHistory } from "react-router-dom";
import { useStateValue } from "../redux/stateProvider";
import useMediaQuery from "@material-ui/core/useMediaQuery";

function Home2() {
  const history = useHistory();
  const [{ user, dataDisco }, dispatch] = useStateValue();
  const [flag, setFlag] = useState(false);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestion] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [searchType, setSearchType] = useState("kw");
  const matches = useMediaQuery("(max-width:900px)");

  useEffect(() => {
   
    reSize();
    if (dataDisco.length !== 0) {
      dispatch({
        type: "SET_XDATA",
        ydata: [],
      });
      dispatch({
        type: "SET_SUGGESTIONS_CL",
        suggestion: [],
      });
    }
    window.addEventListener("resize", () => {
      reSize();
    });
  }, [user]);
  
  const reSize = () => {
    let vh = window.innerHeight * 0.01;

    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
  const getSuggestionData = async (nValue) => {
    var sugg = await searchService
      .getCluster(nValue)
      .then((res) => {
        // console.log(res.data);
        setClusters(res.data);
      })
      .catch((err) => console.clear());
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : clusters.filter(
          (lang) =>
            lang.label.toLowerCase().slice(0, inputLength) === inputValue
        );
  };
  const getSuggestionValue = (suggestion) => suggestion.label;

  const renderSuggestion = (suggestion) => <div>{suggestion.label}</div>;
  let onchange = (event, { newValue }) => {
    setValue(newValue);
    getSuggestionData(newValue);
  };

  let onSuggestionsFetchRequested = ({ value }) => {
    setSuggestion(getSuggestions(value));
  };

  let onSuggestionsClearRequested = () => {
    setSuggestion([]);
  };
  const inputProps = {
    placeholder: "Ready to search",
    value,
    onChange: onchange,
  };
  // const onTagsChanged = (tags) => {
  //   //console.log("tags changed to: ", tags);
  //   setTags(tags);
  // };
  let handleSubmitEnter = (e) => {
    let xvalue = value.replace(/[!?@#$%^&*/.<>,]/g, "");
    if (e.key == "Enter") {
      if (xvalue.length == 0) {
        alert("Please Type Something And Hit Enter");
      } else {
        if (searchType === "Author") {
          history.push(
            "/result?tags=" +
              capitalize(xvalue).trim().split(" ").join("+") +
              "&sb=" +
              searchType
          );
        } else {
          history.push(
            "/result?tags=" +
              xvalue.trim().split(" ").join("+") +
              "&sb=" +
              searchType
          );
        }
      }
    }
  };
  let capitalize = (string) => {
    var separateWord = string.toLowerCase().split(" ");
    for (var i = 0; i < separateWord.length; i++) {
      separateWord[i] =
        separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
    }
    return separateWord.join(" ");
  };
  let handleSubmit = (e) => {
    let xvalue = value.replace(/[!@#$%^&*/'".><,()]/g, "");

    if (xvalue.length == 0) {
      alert("Please Type Something And Hit Enter");
    } else {
      if (searchType === "Author") {
        history.push(
          "/result?tags=" +
            capitalize(xvalue).trim().split(" ").join("+") +
            "&sb=" +
            searchType
        );
      } else {
        history.push(
          "/result?tags=" +
            xvalue.trim().split(" ").join("+") +
            "&sb=" +
            searchType
        );
      }
    }
  };

  let handleSearchChange = (event) => {
    setSearchType(event.target.value);
  };

  return (
    <div className="firstBody">
      <div
        className="navBar"
        style={flag ? { height: "fit-content" } : { height: "unset" }}
      >
        <div className="nav__left">
          <div className="nav__left1">
            <Link to="/">
              <img src={logo} alt="poly image" />
            </Link>
            <span>Topic Expert</span>
          </div>
          <div className="nav__left2">
            <MenuIcon fontSize="large" onClick={() => setFlag(!flag)} />
            {user.loggedIn ? (
              <ProfileDropDown />
            ) : (
              <Link to="/signin" className="signIn">
                Signin
              </Link>
            )}
          </div>
        </div>
        <div className="nav__right" style={flag ? { display: "flex" } : null}>
          <Link to="/">What is Topic Expert?</Link>

          <Link to="/topics">Topics</Link>

          <Link to="/authorsearch">Author Search</Link>

          <Link to="#">About Topic Expert</Link>

          <Link to="#">Contact</Link>

          {!matches &&
            (user.loggedIn ? (
              <ProfileDropDown />
            ) : (
              <Link to="/signin" className="signIn">
                Signin
              </Link>
            ))}
        </div>
      </div>
      <div className="homeBody" style={flag ? { paddingTop: "10vh" } : null}>
        <h1>SEARCH AND LEARN</h1>
        <div className="citation">Unraveling scientific knowledge.</div>

        <div className="form__class">
          <div className="form__div">
            <div className="textInput" onKeyDown={handleSubmitEnter}>
              <div className="selectDiv">
                <select name="fields" onChange={handleSearchChange}>
                  <option value="kw">Search By</option>
                  <option value="Topic">Topic</option>
                  <option value="Author">Author</option>
                  <option value="Title">Title</option>
                </select>
              </div>
              {/* <TagInput tags={tags} onTagsChanged={onTagsChanged} /> */}
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
              />
            </div>

            <Button onClick={handleSubmit} variant="success">
              Search
            </Button>
          </div>
        </div>
        <div>Advanced Search</div>
      </div>
    </div>
  );
}

export default Home2;
