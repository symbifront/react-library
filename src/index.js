import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import reportWebVitals from './reportWebVitals';
import RsqlQueryBuilder from './components/RsqlQueryBuilder';
import AGGridInfinite from './components/AGGridInfinite';

const fields = {
  principleType: {
    text: 'Principle type'
  },
  executionDate: {
    text: 'Execution Date',
    hour: true,
    type: 'date',
  }
};

ReactDOM.render(
  <React.StrictMode>
    <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
    <AGGridInfinite />
    </div>
    <RsqlQueryBuilder
      fields={fields}
      filters="executionDate=='2021-12-25 00:00:00'"
      onFilterApply={(query) => {}}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
