import React, { useEffect, useReducer } from 'react'
import styled from 'styled-components';
import * as PropTypes from 'prop-types'
import moment from 'moment';
import { Button, DatePicker, Input, Select, Typography } from 'antd';

// icons
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const Div = styled.div`
  padding: 15px;

  .rsqlQueryBuilder-value {
    width: 100%;
  }

  .rsqlQueryBuilder-operator {
    margin: 0px 15px;
  }
  .rsqlQueryBuilder-delete {
    margin-left: 15px;
  }

  .rsqlQueryBuilder-filter {
    display: flex;
    margin: 15px 0px;
  }

  .rsqlQueryBuilder-actions-clear {
    margin: 0px 15px;
  }

  .rsqlQueryBuilder-query {
    margin: 15px 0px;
  }
`;

const OPERATORS = [
  { text: 'equals' ,value: '=='},
  { text: 'not equals' ,value: '!='},
  { text: 'like' ,value: '=like='},
  { text: 'not like' ,value: '=notlike='},
  { text: 'lesser than' ,value: '<'},
  { text: 'lesser than or equals' ,value: '<='},
  { text: 'greater than' ,value: '>'},
  { text: 'greater than or equals' ,value: '>='},
  { text: 'in' ,value: '=in='},
  { text: 'search' ,value: 'q'},
];

const INITIAL_FILTER = { field: null, operator: null, type: 'string', value: null };
const INITIAL_STATE = '';

let filterHasChanged = false;
let query = '';

function reducer(state, action) {
  filterHasChanged = true;
  switch (action.type) {
    case 'ADD_FILTER':
      return state.concat({...INITIAL_FILTER});
    case 'CHANGE_FILTER':
      const { index, data } = action.payload;
      const newState = JSON.parse(JSON.stringify(state));
      const keysData = Object.keys(data);
      keysData.forEach((key) => {
        newState[index][key] = data[key];
      })
      return newState;
    case 'CHANGE_FULL_FILTER_FROM_PARENT':
      return action.payload.data;
    case 'DELETE_FILTER':
      if (state.length === 1) return [...INITIAL_STATE];
      const newStateAfterDelete = [...state];
      newStateAfterDelete.splice(action.payload.index, 1);
      return newStateAfterDelete;
    case 'INITIALIZE_FILTER':
      return [{...INITIAL_FILTER}];
    default:
      throw new Error();
  }
}

const getQueryFromState = (state) => {
  let query = '';
  state.forEach((filter) => {
    if (filter.value) {
      if (query.length > 0) query +=';';

      const { field, operator, value} = filter;

      query += `${field}${operator}${operator==='=in=' ? '(' : "'"}${value}${operator==='=in=' ? ')' : "'"}`;
    }
  })
  return query;
}

const getStateFromQuery = (query) => {
  if (!query || query.length === 0) return [INITIAL_FILTER];
  const listFilters = query.split(';');
  const state = [];
  listFilters.forEach((filter) => {
    const operatorsToReplace = {}
    OPERATORS.forEach((operator) => {
      operatorsToReplace[operator.value] = `operatorRSQL${operator.value}operatorRSQL`;
    })
    var regularExpression = new RegExp(Object.keys(operatorsToReplace).join("|"),"gi");
    const filterOpetatorReplaced = filter.replace(regularExpression, function(matched){
      return operatorsToReplace[matched];
    });
    const [field, operator, value] = filterOpetatorReplaced.split('operatorRSQL');
    let valueParsed = value;
    if (valueParsed[0] === "'" || valueParsed[0] === "(") valueParsed = valueParsed.substring(1,valueParsed.length - 1);
    state.push({ field, operator, value: valueParsed });
  });
  return state;
}

const RsqlQueryBuilder = ({ fields, filters, filterUpdated, onFilterApply, onFilterChange, operators, showActions }) => {
  const [state, dispatch] = useReducer(reducer, getStateFromQuery(filters));
  if (filterHasChanged) {
    query = getQueryFromState(state);
    onFilterChange(query);
    filterHasChanged = false;
  }

  useEffect(() => {
    dispatch({ type: 'CHANGE_FULL_FILTER_FROM_PARENT', payload: { data: getStateFromQuery(filters) } });
  }, [filterUpdated])

  return (
    <Div>
      {
        state.map((filter, index) => (
          <div className="rsqlQueryBuilder-filter">
            <Select
              className="rsqlQueryBuilder-field"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              minWidth={200}
              showSearch
              onChange={(value) => {
                dispatch({ type: 'CHANGE_FILTER', payload: { index, data: { field: value, value: null } } });
              }}
              placeholder="Field"
              value={filter.field}
            >
              {
                Object.keys(fields).map((fieldKey, indexField) => {
                  const field = fields[fieldKey];
                  return (
                    (<Option value={fieldKey}>{field.text || fieldKey}</Option>)
                  );
                })
              }
            </Select>
            <Select
              className="rsqlQueryBuilder-operator"
              disabled={!filter.field}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              minWidth={150}
              showSearch
              onChange={(value) => {
                dispatch({ type: 'CHANGE_FILTER', payload: { index, data: { operator: value } } });
              }}
              placeholder="Operator"
              value={filter.operator}
            >
              {
                operators.map((operator) => (<Option value={operator.value}>{operator.text || operator.value}</Option>))
              }
            </Select>
            {fields[filter.field] && (fields[filter.field].type === 'Date' || fields[filter.field].type === 'Timestamp') ? (
              <DatePicker
                className="rsqlQueryBuilder-value"
                defaultValue={filter.value && filter.value.length > 0 ? moment(filter.value, 'YYYY-MM-DD') : null}
                format="DD-MM-YYYY"
                onChange={(_, valueReversed) => {
                  const [day, month, year] = valueReversed.split('-');
                  const suffixDate =  fields[filter.field].type === 'Timestamp' ? ' 00:00:00': '';
                  const value = `${year}-${month}-${day}${suffixDate}`;
                  dispatch({ type: 'CHANGE_FILTER', payload: { index, data: { value } } });
                }}
              />
            ) : (
              <Input
                className="rsqlQueryBuilder-value"
                disabled={!filter.field || !filter.operator}
                onChange={(input)=> {
                  const value = input.target.value;
                  dispatch({ type: 'CHANGE_FILTER', payload: { index, data: { value } } });
                }}
                placeholder="Write Value..."
                value={filter.value}
              />
            )}
            <Button
              className="rsqlQueryBuilder-delete"
              icon={<DeleteOutlined />}
              onClick={() => {
                dispatch({ type: 'DELETE_FILTER', payload: { index  } });
              }}
              shape="circle"
              type="danger"
            >
            </Button>
          </div>
        ))
      }
      <div className="rsqlQueryBuilder-actions">
        <Button
          className="rsqlQueryBuilder-actions-add"
          onClick={() => {
            dispatch({ type: 'ADD_FILTER' });
          }}
        >
          Add filter
        </Button>
        {showActions && (
          <>
            <Button
              className="rsqlQueryBuilder-actions-clear"
              onClick={() => {
                dispatch({ type: 'INITIALIZE_FILTER' });
              }}
              type="primary" danger ghost
            >
              Clear / Reset
            </Button>
            <Button
              className="rsqlQueryBuilder-actions-filter"
              onClick={() => {
                onFilterApply(query);
              }}
              type="primary"
            >
              Filter
            </Button>
          </>
        )}
      </div>
      <div className="rsqlQueryBuilder-query">
        <Text color="dimgrey">{query}</Text>
      </div>
    </Div> );
};

RsqlQueryBuilder.propTypes = {
  fields: PropTypes.object,
  filters: PropTypes.string,
  filterUpdated: PropTypes.number,
  onFilterChange: PropTypes.func,
  onFilterApply: PropTypes.func.isRequired,
  operators: PropTypes.array,
  showActions: PropTypes.bool,
};

RsqlQueryBuilder.defaultProps = {
  fields: {},
  filterUpdated: null,
  filters: INITIAL_STATE,
  onFilterChange: () => {},
  operators: OPERATORS,
  showActions: true
};

export default RsqlQueryBuilder;
