import pytest

from ..markdown import convert_to_sections, update_sections


def test_convert_to_sections_one_header():
    text = "## Header 1\nfoo\n"

    sections = convert_to_sections(text)

    assert sections == {"Header 1": "foo"}


def test_convert_to_sections_two_headers():
    text = "## Header 1\nfoo\n## Header 2\nbar\n"

    sections = convert_to_sections(text)

    assert sections == {"Header 1": "foo", "Header 2": "bar"}


def test_convert_to_sections_three_headers():
    text = "## Header 1\nfoo\n## Header 2\nbar\n## Header 3\nbaz\n"

    sections = convert_to_sections(text)

    assert sections == {"Header 1": "foo", "Header 2": "bar", "Header 3": "baz"}


def test_convert_to_sections_sub_headers():
    text = "## Header 1\n### Header 2\nfoo\n"

    sections = convert_to_sections(text)
    assert sections == {"Header 1": {"Header 2": "foo"}}


def test_convert_to_sections_sub_sub_headers():
    text = "## Header 1\n### Header 2\n#### Header 3\nfoo\n"

    sections = convert_to_sections(text)
    assert sections == {"Header 1": {"Header 2": {"Header 3": "foo"}}}


def test_convert_to_sections_sub_sub_sub_headers():
    text = "## Header 1\n### Header 2\n#### Header 3\n##### Header 4\nfoo\n"

    sections = convert_to_sections(text)
    assert sections == {"Header 1": {"Header 2": {"Header 3": {"Header 4": "foo"}}}}


def test_convert_to_section_multiple_sub_headers():
    text = "## Header 1\n### Header 2\nfoo\n### Header 3\nbar\n"

    sections = convert_to_sections(text)
    assert sections == {"Header 1": {"Header 2": "foo", "Header 3": "bar"}}


def test_convert_to_section_sub_headers_higher_than_max_depth():
    text = "## Header 1\n### Header 2\nfoo\n#### Header 3\nbar\n"

    with pytest.raises(ValueError):
        convert_to_sections(text, max_depth=3)


def test_ignore_level_1_headers():
    text = "# Header 1\n## Header 2\nfoo\n"

    sections = convert_to_sections(text)

    assert sections == {"Header 2": "foo"}


def test_reset_lower_headers():
    text = "## Header 1\n### Header 2\nfoo\n## Header 3\nbar\n"

    sections = convert_to_sections(text)

    assert sections == {"Header 1": {"Header 2": "foo"}, "Header 3": "bar"}


def test_update_sections_different_sub_header():
    sections = {"Header 1": {"Header 2": "foo"}}
    new_section = {"Header 1": {"Header 3": "bar"}}

    updated_sections = update_sections(sections, new_section)

    assert updated_sections == {"Header 1": {"Header 2": "foo", "Header 3": "bar"}}


def test_update_section_sub_sub_header():
    sections = {"Header 1": {"Header 2": {"Header 3": "foo"}}}
    new_section = {"Header 1": {"Header 2": {"Header 4": "bar"}}}

    updated_sections = update_sections(sections, new_section)

    assert updated_sections == {
        "Header 1": {"Header 2": {"Header 3": "foo", "Header 4": "bar"}}
    }


def test_update_section_newline():
    sections = {"Header 1": {"Header 2": "foo"}}
    new_section = {"Header 1": {"Header 2": "bar"}}

    updated_sections = update_sections(sections, new_section)

    assert updated_sections == {"Header 1": {"Header 2": "foo\nbar"}}
