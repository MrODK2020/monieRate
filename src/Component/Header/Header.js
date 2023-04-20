import React, { useState, useEffect } from 'react';
import { GiTargeting, GiScales } from 'react-icons/gi'
import {BsCurrencyDollar } from 'react-icons/bs'
import { MdOutlineCurrencyExchange } from 'react-icons/md'
import { Container, Card, CardBody, Button, Row, Col, } from 'reactstrap';
import LineChart from './Line';
import { baseUrl } from './baseUrl';

const DollarApp = () => {

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednessday', 'Thursday', 'Friday', 'Saturday']
  const getTim = () => {
    const d = new Date();
    const Getday = d.getDay();
    const minute = d.getMinutes();
    const seconds = d.getSeconds();
    const hour = d.getHours();

    let time;
    if ( minute < 10) {
      minute = '0' + minute;
    }
    if (hour > 12) {
      return time = `${hour - 12}:${minute}:${seconds}PM`
    } else if (hour == 12) {
      return time = `${hour}:${minute}:${seconds}PM`
    } else {
      return time = `${hour}:${minute}:${seconds}AM`
    }
  }
  const [ officialRate, setOfficialRate ] = useState([]);
  const [ blueRate, setBlueRate ] = useState([]);
  const [ showBlue, setShowBlue ] = useState(true);
  const [ currentOfficialPrice, setCurrentOficialPrice ] = useState();
  const [ currentBluePrice, setCurrentBluePrice ] = useState();
  const [ startDate, setStartDate ] = useState();
  const [ endDate, setEndDate ] = useState();
  /* 
  const [ officialData, setOfficialData ] = useState([]); */
  
  useEffect(() => {
    const official = [];
    let i = 0;
    const num = [];
    const getofficial = () => {
      i += 1;
      num.push(i);
      fetch("https://dolar-api-argentina.vercel.app/v1/dolares/oficial").then(resp => resp.json())
      .then(resp => {
        official.push({x: i, y: resp.venta, minute: new Date().getMinutes()})
        console.log('official', official);
        CheckUpdateAndPostToDbForOfficial(resp.venta, resp.compra, resp.nombre);
        console.log('official calling', official);
      });
    };
    const Blue = [];
    let j = 0;
    const getBlueData = () => {
      j += 1;
      fetch('https://dolar-api-argentina.vercel.app/v1/dolares/blue').then(resp => resp.json())
      .then(resp => {
        Blue.push({x: j, y: resp.venta});
        console.log("last_blue", Blue[Blue.length - 1].y)
        CheckUpdateAndPostToDbForBlue(resp.venta, resp.compra, resp.nombre);
      });
    }

    const CheckUpdateAndPostToDbForOfficial = (venta, compra, nombre) => {
      const time = getTim();
      var obj = {
        venta: venta,
        compra: compra,
        nombre: nombre,
        time: time
      }
      fetch(baseUrl.url + '/users/official', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(resp => resp.json());
    }
  

    const CheckUpdateAndPostToDbForBlue = (venta, compra, nombre) => {
      const time = getTim();
      var obj = {
        venta: venta,
        compra: compra,
        nombre: nombre,
        time: time
      }
      fetch(baseUrl.url + '/users/blue', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(resp => resp.json());
    }

    const off = [];
    const getDataFromDbOfficial = () => {
      fetch(baseUrl.url + '/users/official').then(resp => resp.json())
      .then(resp => {
        if (off.length === 0) {
          resp.status.forEach(element => {
            off.push({time: element.time, venta: element.venta, day: element.day});
          })
        } else {
          off.push({time: resp.status[resp.status.length - 1].time, venta: resp.status[resp.status.length - 1].venta, day: resp.status[resp.status.length - 1].day})
        }
        console.log('off', off)
        setOfficialRate(off);
        setCurrentOficialPrice(off[off.length - 1].venta);
        console.log("officialRate",officialRate);
      })
    }


    const blueD = [];
    const getDataFromDbBlue = () => {
      fetch(baseUrl.url + '/users/blue').then(resp => resp.json())
      .then(resp => {
        if (blueD.length === 0) {
          resp.status.forEach(element => {
            blueD.push({time: element.time, venta: element.venta, day: element.day});
          });
        } else {
          blueD.push({time: resp.status[resp.status.length - 1].time, venta: resp.status[resp.status.length - 1].venta, day: resp.status[resp.status.length - 1].day})
        }
        setBlueRate(blueD);
        console.log('blue', blueD);
        setCurrentBluePrice(blueD[blueD.length - 1].venta);
      })
    }
    getDataFromDbOfficial();
    getDataFromDbBlue();

    var inter = setInterval(() => {
      getofficial();
      getBlueData();
    }, 60000);

    var inter2 = setInterval(() => {
      getDataFromDbOfficial();
      getDataFromDbBlue();
    }, 80000)

    return () => {clearInterval(inter); clearInterval(inter2)};

  }, [])

/*   const CheckUpdateAndPutToDbForOfficial = (venta, compra, nombre) => {
    var obj = {
      venta: venta,
      compra: compra,
      nombre: nombre
    }
    fetch(baseUrl.url + '/users/official', {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(resp => resp.json());
  } */

  
/*   const CheckUpdateAndPutToDbForBlue = (venta, compra, nombre) => {
    var obj = {
      venta: venta,
      compra: compra,
      nombre: nombre
    }
    fetch(baseUrl.url + '/users/blue', {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(resp => resp.json());
  } */





  

  //official line graph
  
  const officialChart = {
    labels: officialRate.map(data => data?.time),
    datasets: [{
      label: 'Official status',
      data: officialRate.map(data => data.venta),
      backgroundColor: 'hsla(22, 75%, 72%, 0.4)',
      pointHoverRadius: 2,
      borderColor: '#FF5D00',
      fill: true,
      tension: 0.5,
      borderJoinStyle: 'bevel',
      pointRadius: 2,
      pointStyle: 'rectRot',
      capBezierPoints: true,
    }]
  }

  const blueChart = {
    labels: blueRate.map(data => data?.time),
    datasets: [{
      label: 'Blue status',
      data: blueRate.map(data => data.venta),
      backgroundColor: 'hsl(216, 62%, 72%)',
      pointHoverRadius: 9,
      borderColor: '#4F6587',
      fill: true,
      tension: 0.5,
      borderJoinStyle: 'bevel',
      pointRadius: 2,
      pointStyle: 'rectRot',
      capBezierPoints: true,
    }]
  }

  const chartInnerInnerBody = document.querySelector('.chartInnerInnerBody');
  const totalLength = officialChart.labels.length;
  if (totalLength > 5) {
    console.log("inner width",window.innerWidth)
    console.log("outer width",window.outerWidth)
    const outerWidth = window.outerWidth;
    if (outerWidth >= 1200) {
      const newWidth = 800 + ((totalLength - 5) * 30);
      chartInnerInnerBody.style.width = `${newWidth}px`;
    } else if (outerWidth >= 997 && outerWidth < 1200) {
      const newWidth = 600 + ((totalLength - 5) * 30);
      chartInnerInnerBody.style.width = `${newWidth}px`;
    } else if (outerWidth >= 768 && outerWidth < 997) {
      const newWidth = 400 + ((totalLength - 5) * 30);
      chartInnerInnerBody.style.width = `${newWidth}px`;
    } else if (outerWidth >= 414 && outerWidth < 768) {
      const newWidth = 300 + ((totalLength - 5) * 30);
      chartInnerInnerBody.style.width = `${newWidth}px`;
    } else if (outerWidth <= 413) {
      const newWidth = 250 + ((totalLength - 5) * 30);
      chartInnerInnerBody.style.width = `${newWidth}px`;
    }
  }

  return (
    <Container fluid className='d_main_container'>
        <header className='d_header'>
          <section className='d_header_left'>
            <div className='d_header_div'>
              <div>
                <h4 className='header_left_text'>
                  Latest dollar exchange rate in argentina with chart representation.
                </h4>
                <a href='#chart'><Button className='d_header_left_button'>
                  Check $ current rate
                </Button></a>
              </div>
            </div>
            <img className='img-fluid .d-none .d-sm-block left_img' src={require('../../Component/assets/images/real.jpeg')} alt="..."></img>
          </section>
          <section className='d_header_right'>
           <div className='d_header_right_div'>
            <img className='img-fluid d_header_right_img' src={require('../../Component/assets/images/real.jpeg')} alt='...'></img>
            <img className='img-fluid right_img' src={require('../../Component/assets/images/dolla1.jpeg')} alt="..."></img>
           </div>
          </section>
        </header>
        <main className='d_main'>
          <div>
            <section className='main_top'>
              <div className='inner_main_top_div'>
                <h4 className='main_top_h4'>
                  Start by navigating to the chart to get and monitor the current and past dollar rates<br/>  The correct dollar rate.
                </h4>
                <div className='currency_icons'>
                  <div>
                    <div className='avatar'> <BsCurrencyDollar className='icons'/></div>
                    <h6 className='text-center'>Dollar rate</h6>
                  </div>
                  <div>
                    <div className='avatar'><GiScales className='icons' /></div>
                    <h6 className='text-center'>Dollar scale</h6>
                  </div>
                  <div>
                    <div className='avatar'><MdOutlineCurrencyExchange className='icons' /></div>
                    <h6 className='text-center'>Reload</h6>
                  </div>
                  <div>
                    <div className='avatar'><GiTargeting className='icons' /></div>
                    <h6 className='text-center'>Spinning $</h6>
                  </div>
                </div>
              </div>
            </section>
            <hr className='line'></hr>
            <section id="chart" className='main_bottom d-flex justify-content-center'>
              <div className='chart_div '>
                <Card className='d_card'>
                  <Row>
                    <div>
                      <Col sm='12' md='12'>
                      {showBlue ? <h4 className='d_card_title text-center'>Official Dollar Rate</h4> : <h4 className='d_card_title text-center'>Blue Dollar Rate</h4>}
                      <Col className=' d_card_header'>
                        <div className='prices'>
                          {showBlue ? <h5 className='current_price'>ARS {currentOfficialPrice}</h5> : 
                          <h5 className='current_price'>ARS {currentBluePrice}</h5>}</div>
                        <Button className='show_btn' onClick={() => setShowBlue(!showBlue)}>
                          {showBlue ? <h6 className='show_btn_text'>Show Blue Chart</h6> : <h6 className='show_btn_text'>Show Official Chart</h6>}
                        </Button>
                      </Col>
                    </Col>
                    <Col sm='12' md='12' lg='12' xl='12' xs='11'>
                      { showBlue ? 
                        <div className='chartBody'>
                          <div className='chartInnerBody'>
                            <div className='chartInnerInnerBody'>
                              <LineChart data={officialChart} /> 
                            </div>
                          </div>
                        </div>
                      : 
                        <div className='chartBody'>
                          <div className='chartInnerBody'>
                            <div className='chartInnerInnerBody'>
                              <LineChart data={blueChart} />
                            </div>
                          </div>
                        </div>
                      }
                    </Col>
                    <Col sm='12' md='12' lg='12' xl='12' xs='11'>
                      <h5 className='select_text'>Select start date and finish date to know dollar movement over time.</h5>
                      <div className='getting_section'>
                        <div className='left_input'>
                          <label className='input_label'>Start date</label>
                          <input type='date' name='start_date'  onChange={(e) => setStartDate(e.target.value)}/>
                        </div>
                        <div className='right_input'>
                          <label  className='input_label'>End date</label>
                          <input type='date' name='endDate'  onChange={(e) => {setEndDate(e.target.value)
                            }} />
                        </div>
                      </div>
                      <div className='get'>
                        <Button className='get_btn'>
                          Get
                        </Button>
                      </div>
                    </Col>
                    </div>
                  </Row>
                  <CardBody>

                  </CardBody>
                </Card>
              </div>
            </section>
          </div>
        </main>
        <footer className='footer'>
          <span>&copy; DollarEx.org, All reserved </span>
        </footer>
    </Container>
  )
}

export default DollarApp;