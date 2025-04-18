import React, { FC } from 'react';
import { RouteComponentProps } from '@reach/router';
import { APIResponse } from '../../hooks/useFetch';
import { UncontrolledAlert, Table, Badge } from 'reactstrap';
import { formatRelative, createExternalExpressionLink, humanizeDuration, formatDuration } from '../../utils';
import { Rule } from '../../types/types';
import { now } from 'moment';

interface RulesContentProps {
  response: APIResponse<RulesMap>;
}

interface RuleGroup {
  name: string;
  file: string;
  rules: Rule[];
  evaluationTime: string;
  lastEvaluation: string;
}

export interface RulesMap {
  groups: RuleGroup[];
}

const GraphExpressionLink: FC<{ expr: string; text: string; title: string }> = (props) => {
  return (
    <>
      <strong>{props.title}:</strong>
      <a className="ml-4" href={createExternalExpressionLink(props.expr)}>
        {props.text}
      </a>
      <br />
    </>
  );
};

export const RulesContent: FC<RouteComponentProps & RulesContentProps> = ({ response }) => {
  const getBadgeColor = (state: string) => {
    switch (state) {
      case 'ok':
        return 'success';

      case 'err':
        return 'danger';

      case 'unknown':
        return 'warning';
    }
  };

  if (response.data) {
    const groups: RuleGroup[] = response.data.groups;
    return (
      <>
        <h2>Rules</h2>
        {groups.map((g, i) => {
          return (
            <Table bordered key={i}>
              <thead>
                <tr>
                  <td colSpan={3}>
                    <a href={'#' + g.name}>
                      <h2 id={g.name}>{g.name}</h2>
                    </a>
                  </td>
                  <td>
                    <h2>{formatRelative(g.lastEvaluation, now())} ago</h2>
                  </td>
                  <td>
                    <h2>{humanizeDuration(parseFloat(g.evaluationTime) * 1000)}</h2>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr className="font-weight-bold">
                  <td>Rule</td>
                  <td>State</td>
                  <td>Error</td>
                  <td>Last Evaluation</td>
                  <td>Evaluation Time</td>
                </tr>
                {g.rules.map((r, i) => {
                  return (
                    <tr key={i}>
                      {r.alerts ? (
                        <td className="rule-cell">
                          <GraphExpressionLink title="alert" text={r.name} expr={`ALERTS{alertname="${r.name}"}`} />
                          <GraphExpressionLink title="expr" text={r.query} expr={r.query} />
                          {r.duration > 0 && (
                            <div>
                              <strong>for:</strong> {formatDuration(r.duration * 1000)}
                            </div>
                          )}
                          {r.keepFiringFor > 0 && (
                            <div>
                              <strong>keep_firing_for:</strong> {formatDuration(r.keepFiringFor * 1000)}
                            </div>
                          )}
                          <div>
                            <strong>labels:</strong>
                            {Object.entries(r.labels).map(([key, value]) => (
                              <div className="ml-4" key={key}>
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                          <div>
                            <strong>annotations:</strong>
                            {Object.entries(r.annotations).map(([key, value]) => (
                              <div className="ml-4" key={key}>
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                        </td>
                      ) : (
                        <td>
                          <GraphExpressionLink title="record" text={r.name} expr={r.name} />
                          <GraphExpressionLink title="expr" text={r.query} expr={r.query} />
                          <strong>labels:</strong>
                          {Object.entries(r.labels).map(([key, value]) => (
                            <div className="ml-4" key={key}>
                              {key}: {value}
                            </div>
                          ))}
                        </td>
                      )}
                      <td>
                        <Badge color={getBadgeColor(r.health)}>{r.health.toUpperCase()}</Badge>
                      </td>
                      <td>{r.lastError ? <UncontrolledAlert color="danger">{r.lastError}</UncontrolledAlert> : null}</td>
                      <td>{formatRelative(r.lastEvaluation, now())} ago</td>
                      <td>{humanizeDuration(parseFloat(r.evaluationTime) * 1000)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          );
        })}
      </>
    );
  }

  return null;
};
