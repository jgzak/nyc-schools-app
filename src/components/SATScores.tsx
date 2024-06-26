/**
 * Represents a component that displays SAT scores for a selected school.
 * 
 * @component
 * @example
 * // Usage:
 * <SATScores selectedSchool={selectedSchool} initView={initView} />
 * 
 * @param {InputProps} props - The input properties for the component.
 * @param {School | null} props.selectedSchool - The selected school object.
 * @param {boolean} props.initView - A flag indicating whether the component is in initial view mode.
 * 
 * @returns {JSX.Element} The SATScores component.
 */
import React, { useEffect, useState } from 'react';

import { InputProps, SATScoresForSchool } from '../types';
import { Card } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { getSATScoresForSchool } from '../api/nycschools';
import Pair from './Pair';
import { isEmpty } from 'lodash';

// This array is used to iterate over the SAT scores and display them in the component.
const satScores: [string, keyof SATScoresForSchool][] = [ ["SAT reading score: ", "sat_critical_reading_avg_score"], ["SAT math avg score: ", "sat_math_avg_score"], ["SAT writing score: ", "sat_writing_avg_score"] ];


const SATScores: React.FC<InputProps> = ({selectedSchool, initView}) => {

    const [schoolScores, setSchoolScores] = useState<SATScoresForSchool | null>(null);
    const [errorFetching, setErrorFetching] = useState<boolean>(false);


    useEffect(() => {
        selectedSchool?.dbn && getSATScoresForSchool(selectedSchool?.dbn).then((data) => { 
            // I noticed that response from API is empty array when there is no data for the school, for this case i set schoolScores as object with N/A values
            (data as SATScoresForSchool[])[0] ? setSchoolScores((data as SATScoresForSchool[])[0]) : setSchoolScores({dbn: "N/A", school_name: "N/A", num_of_sat_test_takers: "N/A", sat_critical_reading_avg_score: "N/A", sat_math_avg_score: "N/A", sat_writing_avg_score: "N/A"});
        }).catch(() => {
            setErrorFetching(true);
        })
    }, [selectedSchool]);

    return (
        <Card data-testid="sat-scores-card-dt" className="nyc-schools-card">
            <Card.Header>SAT Scores</Card.Header>
            <Card.Body>
                {!initView && !isEmpty(schoolScores) && <Card.Title>{`SAT takers: ${schoolScores?.['num_of_sat_test_takers']}`}</Card.Title>}
                {errorFetching ? 
                <Card.Text>There was an error fetching the SAT scores</Card.Text> : 
                <>
                    {initView ? <span data-testid={"sat-scores-dt"}>Select school from the list</span> : 
                    ( schoolScores !== null ? satScores.map((scoreDetails) => {
                        // Set the background color of the badge based on the SAT score
                        const bg = parseInt(schoolScores[scoreDetails[1]]) < 400 ? "danger" : parseInt(schoolScores[scoreDetails[1]]) < 600 ? "warning" : (Number.isNaN(parseInt(schoolScores[scoreDetails[1]])) ? "light" : "success");

                        return (<Pair key={scoreDetails[0]} label={scoreDetails[0]} value={schoolScores[scoreDetails[1]]} valueInBadge bg={bg}/>)
                    }) : 
                    <Spinner data-testid="sat-score-spinner-dt" animation="border" variant="primary" />)} 
                </>}
            </Card.Body>
        </Card>
    );
};

export default SATScores;