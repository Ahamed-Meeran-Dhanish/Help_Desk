import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTicketHistory } from '../ticketSlice';

function TicketHistory({ ticketId }) {
    const { history, isLoading } = useSelector((state) => state.tickets);
    const dispatch = useDispatch();

    useEffect(() => {
        if (ticketId) {
            dispatch(getTicketHistory(ticketId));
        }
    }, [dispatch, ticketId]);

    if (isLoading) {
        return <div className="text-center py-4 text-slate-500">Loading history...</div>;
    }

    return (
        <div className='ticket-history'>
            <h3>Ticket History</h3>
            <div className='history-list'>
                {history && history.length > 0 ? (
                    history.map((log) => (
                        <div key={log._id} className='history-item'>
                            <div className='history-header'>
                                <span className='history-action'>{log.action}</span>
                                <span className='history-date'>
                                    {new Date(log.createdAt).toLocaleString('en-US')}
                                </span>
                            </div>
                            <div className='history-body'>
                                <span>Performed by: {log.performedBy ? log.performedBy.name : 'Unknown'}</span>
                                {log.oldValue && log.newValue && (
                                    <div className='history-changes'>
                                        {Object.keys(log.newValue).map((key) => (
                                            // Only show if different
                                            log.oldValue[key] !== log.newValue[key] && (
                                                <div key={key} className='change-detail'>
                                                    <span className='change-field'>{key}:</span>
                                                    <span className='change-from'>{JSON.stringify(log.oldValue[key])}</span>
                                                    {' -> '}
                                                    <span className='change-to'>{JSON.stringify(log.newValue[key])}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                                {/* For notes, we might want to just show the text */}
                                {log.action.includes('Note') && log.newValue.text && (
                                    <div className='note-preview'>
                                        "{log.newValue.text}"
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No history available for this ticket.</p>
                )}
            </div>

            <style jsx>{`
                .ticket-history {
                    margin-top: 2rem;
                    padding: 1rem;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                .history-item {
                    border-bottom: 1px solid #eee;
                    padding: 10px 0;
                }
                .history-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .history-action {
                    font-weight: bold;
                    color: #333;
                }
                .history-date {
                    font-size: 0.8rem;
                    color: #888;
                }
                .history-body {
                    font-size: 0.9rem;
                }
                .change-detail {
                    margin-left: 10px;
                    color: #555;
                }
                .note-preview {
                    font-style: italic;
                    color: #666;
                    margin-top: 4px;
                }
            `}</style>
        </div>
    );
}

export default TicketHistory;
