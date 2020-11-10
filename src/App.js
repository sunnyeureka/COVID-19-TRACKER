import {
  Select,
  FormControl,
  MenuItem,
  Card,
  CardContent,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./App.css";
import Infobox from "./InfoBox";
import LineGraph from "./LineGraph";
import Map from "./Map";
import Table from "./Table";
import { prettyPrintStat, sortData } from "./util";
import "leaflet/dist/leaflet.css";
import "./util.js";
import { Helmet } from "react-helmet";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 4.9, lng: -1.766667 });
  const [mapZoom, setMapZoom] = useState(2.2);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const TITLE = "COVID-19 Tracker";

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, //united states
            value: country.countryInfo.iso2, //uk,usa,fr
          }));

          setTableData(sortData(data)); //sortData from util.js
          setMapCountries(data);
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);

        setCountryInfo(data);
        const mapObj =
          countryCode === "worldwide"
            ? { lat: 4.9, lng: -1.766667 }
            : { lat: data.countryInfo.lat, lng: data.countryInfo.long };
        setMapCenter(mapObj);
        if (countryCode === "worldwide") setMapZoom(2.2);
        else setMapZoom(4);
      });
  };

  console.log(countryInfo);

  return (
    <div className="app">
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <div className="app_left">
        <div className="app_header">
          <h1>COVID-19 TRACKER </h1>
          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app_stats">
          <Infobox
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            total={prettyPrintStat(countryInfo.cases)}
            cases={prettyPrintStat(countryInfo.todayCases)}
          />
          <Infobox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            total={prettyPrintStat(countryInfo.recovered)}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
          />
          <Infobox
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            total={prettyPrintStat(countryInfo.deaths)}
            cases={prettyPrintStat(countryInfo.deaths)}
          />
        </div>

        <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          casesType={casesType}
        />
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Live Cases by Countries</h3>
          <Table countries={tableData} />
          <h3 className="app_graph-title">Worldwide New {casesType}</h3>
          <LineGraph className="app_graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
