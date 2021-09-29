import React, { useEffect, useMemo, useState } from "react";
import "../CSS/Result2.css";
import { withStyles } from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";
import ResultData from "./ResultData";
import { useStateValue } from "../redux/stateProvider";
import { css } from "@emotion/core";
import { useHistory, useLocation } from "react-router-dom";
import searchService from "../__helpers/searchService";
import ClipLoader from "react-spinners/ClipLoader";
import Modals from "./Modals";
import Pagination from "./Pagination";
import { saveAs } from "file-saver";
import Footer from "./Footer";
import Invalid from "./Invalid";
import DateRangeIcon from "@material-ui/icons/DateRange";
import Navbar from "./Navbar";
import ListAltIcon from "@material-ui/icons/ListAlt";
import SearchBar from "./SearchBar";
import um6p from "../assets/images/network1.jpg";
import DualRangeDate from "./DualRangeDate";
import SearchIcon from "@material-ui/icons/Search";
const override = css`
  margin-top: 25%;
  border-color: rgb(54, 215, 183);
`;
const articleTypes = [
  "Journal article",
  "Patent",
  "Conference paper",
  "Book chapter",
  "Book",
  "Book reference entry",
  "Dataset",
  "Repository",
  "Unknown",
];
function Result2() {
  let history = useHistory();
  let query = useQuery();
  const [spinner, setSpinner] = useState(true);
  const [xdata, setdata] = useState([]);
  const [checkedSort, setCheckedsort] = useState("relevency");
  const [suggest, setSuggest] = useState([]);
  const [filteredArtypes, setfilteredArtypes] = useState(articleTypes);
  const [articleTopic, setArticleTopic] = useState([]);
  const [articleType, setArticleType] = useState([]);
  const [{ queries, suggestionsClusters }, dispatch] = useStateValue();
  const [{ dataDisco, searchB, selectedArticleSm }, dispatch1] =
    useStateValue();
  const [flag, setFlag] = useState(false);
  const [bttdis, setbttdis] = useState(false);
  const [year, setYear] = useState([1940, 2021]);
  const [PageSize, setPageSize] = useState(10);
  const [{ currentPage }] = useStateValue();
  useEffect(() => {
    if (query.get("tags") != null || query.get("sb") != null) {
      query.get("tags").length != 0 && query.get("sb").length != 0
        ? getData()
        : setFlag(true);

      dispatch({
        type: "SET_SEARCH_B",
        search: query.get("sb"),
      });
    } else history.push("/");
    reSize();
    window.addEventListener("resize", () => {
      reSize();
    });
  }, []);
  const reSize = () => {
    let vhi = window.innerHeight * 0.01;

    document.documentElement.style.setProperty("--vhi", `${vhi}px`);
  };

  let filterArticleType=(data)=>{
    var arTypes=[]
    var arPro = new Promise(resolve=>{
        data.forEach((element,index) =>{
    arTypes.push(element.Pub_type)
    if (index == data.length -1) {
      resolve(Array.from(new Set(arTypes)))
    }
  } );
    })
    arPro.then(ar=>{
      var artp = articleTypes.filter(m=>ar.includes(m))
      setfilteredArtypes(artp)
    })
  }
  let getData = async () => {
    if (dataDisco.length !== 0) {
      setdata(dataDisco);
      setSpinner(false);
    } else {
      try {
        dispatch({
          type: "SET_QUERIES",
          xquery: query.get("tags"),
        });
        const result = await searchService
          .getData(query.get("tags").split("+"), query.get("sb"))
          .then((res) => {
            if (res.data.length < 10) setbttdis(true);
            if (res.data.response !== 500) {
              //console.log(res.data);
              let arr = res.data[0].filter(
                (v, i, a) =>
                  a.findIndex(
                    (t) => t.Title === v.Title && t.Date === v.Date
                  ) === i
              );
              filterArticleType(res.data[0])
              setdata(arr);
              dispatch1({
                type: "SET_XDATA",
                ydata: arr,
              });
              var Rdata = [];

              var sugg = res.data[1].filter(
                (su) => su.label !== query.get("tags")
              );

              for (var i = 0; i < sugg.length; i += 2) {
                Rdata.push(sugg.slice(i, i + 2));
              }
              setSuggest(Rdata);

              dispatch({
                type: "SET_SUGGESTIONS_CL",
                suggestion: Rdata,
              });
            } else {
              setdata([]);
              setSuggest([]);
            }
          })
          .catch((err) => {
            // console.log(err);
            setdata([]);
            setSuggest([]);
          });
      } catch (error) {
        setdata([]);
        setSuggest([]);
      } finally {
        setSpinner(false);
      }
    }
  };

  let currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    window.scrollTo(0, 0);
    return xdata?.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, xdata, PageSize]);

  let handleInputChange = (event) => {
    const target = event.target;
    var arType = articleType;
    if (target.checked) {
      arType.push(target.name);

      dataDisco.length !== 0 && setSpinner(true);
    } else {
      arType.splice(arType.indexOf(target.name), 1);
      dataDisco.length !== 0 && setSpinner(true);
    }
    setArticleType(arType);
    if (dataDisco.length !== 0) {
      setTimeout(() => {
        setSpinner(false);
      }, 500);
      var filteredArray = dataDisco.filter(function (itm) {
        if (arType.length !== 0) {
          return (
            itm.Date.split("-")[0] >= year[0] &&
            itm.Date.split("-")[0] <= year[1] &&
            arType.includes(itm.Pub_type)
          );
        } else {
          return (
            itm.Date.split("-")[0] >= year[0] &&
            itm.Date.split("-")[0] <= year[1]
          );
        }
      });
      setdata(filteredArray);
    }
  };

  let handleTopicChange = (event) => {
    const target = event.target;
    var arTopic = articleTopic;
    if (target.checked) {
      arTopic.push(target.name);
    } else {
      arTopic.splice(arTopic.indexOf(target.name), 1);
    }
    if (dataDisco.length !== 0) {
      var filteredArray = dataDisco.filter(function (itm) {
        return arTopic.includes(itm.Topics.label);
      });
      arTopic.length == 0 ? setdata(dataDisco) : setdata(filteredArray);
    }
    //console.log(arTopic);
  };

  let convertToCsv = () => {
    var csvData = [];
    xdata.forEach((ele) => {
      csvData.push({
        Title: ele.Title,
        // Abstract: ele.Abstract,
        // Authors: ele.Authors.map((aut) => {
        //   return aut.fullName;
        // }),
        Date: ele.Date,
      });
    });

    var arrData = typeof csvData != "object" ? JSON.parse(csvData) : csvData;
    var CSV = "";
    if (true) {
      var row = "";

      for (var index in arrData[0]) {
        row += index + ",";
      }
      row = row.slice(0, -1);
      CSV += row + "\r\n";
    }

    for (var i = 0; i < arrData.length; i++) {
      var row = "";
      for (var index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }
      row.slice(0, row.length - 1);
      CSV += row + "\r\n";
    }

    //console.log(str);
    var blob = new Blob([CSV], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "Data.csv");
  };
  let sortBy = (e) => {
    setCheckedsort(e.target.value);
    setSpinner(true);
    setdata([]);
    switch (e.target.value) {
      case "relevency":
        let srtr = xdata.sort((a, b) => {
          if (a.Score > b.Score) {
            return -1;
          }
          if (a.Score < b.Score) {
            return 1;
          }
          return 0;
        });
        setTimeout(() => {
          setSpinner(false);
          setdata(srtr);
          dispatch({
            type: "SET_XDATA",
            ydata: srtr,
          });
        }, 300);
        break;
      case "a-z":
        let srt = xdata.sort((a, b) => {
          if (a.Title < b.Title) {
            return -1;
          }
          if (a.Title > b.Title) {
            return 1;
          }
          return 0;
        });
        setTimeout(() => {
          setSpinner(false);
          setdata(srt);
          dispatch({
            type: "SET_XDATA",
            ydata: srt,
          });
        }, 300);

        break;
      case "z-a":
        let srtz = xdata.sort((a, b) => {
          if (a.Title > b.Title) {
            return -1;
          }
          if (a.Title < b.Title) {
            return 1;
          }
          return 0;
        });
        setTimeout(() => {
          setSpinner(false);
          setdata(srtz);
          dispatch({
            type: "SET_XDATA",
            ydata: srtz,
          });
        }, 300);
        break;
      default:
        break;
    }
  };
  return (
    <div className="temp__Result">
      <Navbar />
      <div className="temp__middleSearch__Result">
        <div className="temp__middleSearch__Result2">
          <img src={um6p} height="250px" />
        </div>
        <div className="temp__middleSearch__Result1">
          <SearchBar
            Query={query.get("tags")?.replace("+", " ")}
            stype={query.get("sb")}
          />
          <Modals xdata2={xdata} />
        </div>
      </div>

      <div className="data__Manipulation">
        <div className="data__ManipulationX">
          <div className="data__Manipulation2">
            <div>
              <span onClick={convertToCsv}>Export</span>
            </div>
            <div>|</div>
            <div>
              <span>Article Per.Page:</span>
              <select
                className="article__PerPage"
                onChange={(e) => {
                  setPageSize(e.target.value);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="data__Manipulation1"></div>
        </div>
      </div>
      <div>
        <div className="temp__main">
          <div className="main__left">
            <h5 className="">FILTER BY :</h5>
            <div className="filter__year">
              <div className="divs__filter">
                <DateRangeIcon fontSize="small" />
                <span>YEAR :</span>
              </div>
              <DualRangeDate
                handleYear={setYear}
                dataManipulation={setdata}
                data={dataDisco}
                artType={articleType}
              />
            </div>

            <form className="articleType__filter">
              <div className="articleTypeDiv__filter">
                <div className="divs__filter">
                  <ListAltIcon fontSize="small" />
                  <span>Article Type</span>
                </div>
                {filteredArtypes.map((data, index) => {
                  return (
                    <label className="container" key={index}>
                      <input
                        name={data === "Other Types" ? "Unknown" : data}
                        type="checkbox"
                        onChange={handleInputChange}
                      />{" "}
                      {data ==="Unknown" ? "Other Types"  : data}
                      <span className="checkmark"></span>
                    </label>
                  );
                })}
              </div>
              <div className="articleTypeDiv__filter">
                <div className="divs__filter">
                  <ListAltIcon fontSize="small" />
                  <span>Topics</span>
                </div>
                <label className="container">
                  <input
                    name="Medecine"
                    type="checkbox"
                    onChange={handleTopicChange}
                  />{" "}
                  Medicine
                  <span className="checkmark"></span>
                </label>
                <label className="container">
                  <input
                    name="Biology"
                    type="checkbox"
                    onChange={handleTopicChange}
                  />{" "}
                  Biology
                  <span className="checkmark"></span>
                </label>
                <label className="container">
                  <input
                    name="art"
                    type="checkbox"
                    onChange={handleTopicChange}
                  />{" "}
                  Art
                  <span className="checkmark"></span>
                </label>
              </div> 
            </form>
          </div>
          {!flag ? (
            <div className="main__right">
              {spinner ? (
                <ClipLoader
                  color="#ffffff"
                  loading={true}
                  css={override}
                  size={100}
                />
              ) : (
                <>
                  <div className="result__numberNrelavence">
                    <div className="result__number">
                      {xdata?.length} Results | {PageSize} Articles P.Page
                    </div>
                    <div className="result__relavence">
                      Sort By:
                      <select onChange={sortBy} value={checkedSort}>
                        <option value="relevency">Relevency</option>
                        <option value="a-z">Alphabetical A-Z</option>
                        <option value="z-a">Alphabetical Z-A</option>
                      </select>
                    </div>
                  </div>
                  <div className="article__section">
                    {xdata?.length !== 0 ? (
                      <>
                        {currentTableData.map((data, index) => {
                          return (
                            <ResultData
                              data={data}
                              key={index}
                              docid={(currentPage - 1) * PageSize + index}
                              check={true}
                              build={true}
                            />
                          );
                        })}

                        <Pagination
                          className="pagination-bar"
                          currentPage={currentPage}
                          totalCount={xdata.length}
                          pageSize={PageSize}
                          onPageChange={(page) =>
                            dispatch({
                              type: "SET_CURRENT_PAGE",
                              current: page,
                            })
                          }
                        />
                      </>
                    ) : (
                      <h5
                        style={{
                          backgroundColor: "#fce5ab",
                          textAlign: "center",
                          marginLeft: "40%",
                          width: "162px",
                        }}
                      >
                        NO DATA FOUND
                      </h5>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <Invalid type="TAGS" />
          )}
          <div className="main__farRight">
            {suggestionsClusters.length !== 0 && (
              <div className="clusters">
                <span>Topics :</span>
                {suggestionsClusters?.map((data, indx) => {
                  return (
                    <div className="nested__clusters" key={indx}>
                      {data.map((d, index) => {
                        return (
                          <p
                            className="nested__clustersLabel"
                            key={index}
                            onClick={() => {
                              window.location.href =
                                "/result?tags=" +
                                d.label.trim().split(" ").join("+") +
                                "&sb=Topic";
                            }}
                          >
                            <SearchIcon fontSize="small" /> {d.label}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "none",
    outline: 0,

    fontSize: 16,
    width: "100%",
    padding: "10px 26px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      backgroundColor: "white",
    },
  },
}))(InputBase);
export default Result2;
