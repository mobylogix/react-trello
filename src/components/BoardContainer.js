import React, {Component} from 'react'
import PropTypes from 'prop-types'
import pick from 'lodash/pick'
import isEqual from 'lodash/isEqual'
import {BoardDiv} from '../styles/Base'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {DragDropContext} from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch'
import Lane from './Lane'

const boardActions = require('../actions/BoardActions')
const laneActions = require('../actions/LaneActions')

class BoardContainer extends Component {
  wireEventBus = () => {
    let eventBus = {
      publish: event => {
        switch (event.type) {
          case 'ADD_CARD':
            return this.props.actions.addCard({laneId: event.laneId, card: event.card})
          case 'REMOVE_CARD':
            return this.props.actions.removeCard({laneId: event.laneId, cardId: event.cardId})
          case 'REFRESH_BOARD':
            return this.props.actions.loadBoard(event.data)
        }
      }
    }
    this.props.eventBusHandle(eventBus)
  }

  componentWillMount () {
    this.props.actions.loadBoard(this.props.data)
    if (this.props.eventBusHandle) {
      this.wireEventBus()
    }
  }

  componentWillReceiveProps (nextProps) {
    // nextProps.data changes when external Board input props change and nextProps.reducerData changes due to event bus or UI changes
    const {data, reducerData, onDataChange} = this.props
    if (onDataChange && nextProps.reducerData && !isEqual(reducerData, nextProps.reducerData)) {
      onDataChange(nextProps.reducerData)
    }
    if (nextProps.data && nextProps.data !== data) {
      this.props.actions.loadBoard(nextProps.data)
    }
  }

  render () {
    const {reducerData, style, ...otherProps} = this.props
    console.log('props in BoardContainer')
    console.log(this.props)
    return (
      <BoardDiv style={style} {...otherProps}>
        {reducerData.lanes.map(lane => {
          const {id, droppable, ...otherProps} = lane
          const passthroughProps = pick(this.props, [
            'onLaneScroll',
            'onCardClick',
            'onLaneClick',
            'laneSortFunction',
            'draggable',
            'handleDragStart',
            'handleDragEnd',
            'customCardLayout',
            'customLaneHeader',
            'tagStyle',
            'children'
          ])
          return <Lane key={`${id}`} id={id} droppable={droppable === undefined ? true : droppable} {...otherProps} {...passthroughProps} handleInput={this.props.handleInput} inputStyles={this.props.inputStyles} inputPlaceholder={this.props.inputPlaceholder} />
        })}
      </BoardDiv>
    )
  }
}

BoardContainer.propTypes = {
  data: PropTypes.object.isRequired,
  onDataChange: PropTypes.func,
  eventBusHandle: PropTypes.func,
  onLaneScroll: PropTypes.func,
  onCardClick: PropTypes.func,
  onLaneClick: PropTypes.func,
  laneSortFunction: PropTypes.func,
  draggable: PropTypes.bool,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func,
  customCardLayout: PropTypes.bool,
  customLaneHeader: PropTypes.element,
  style: PropTypes.object,
  tagStyle: PropTypes.object,
  inputPlaceholder: PropTypes.string,
  inputStyles: PropTypes.object,
  handleInput: PropTypes.func
}

const mapStateToProps = state => {
  return state.lanes ? {reducerData: state} : {}
}

const mapDispatchToProps = dispatch => ({actions: bindActionCreators({...boardActions, ...laneActions}, dispatch)})

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(MultiBackend(HTML5toTouch))(BoardContainer))
