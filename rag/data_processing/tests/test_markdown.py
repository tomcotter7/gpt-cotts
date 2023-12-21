from ..markdown import convert_to_sections


def test_convert_to_sections_one_header():
    text = "## Header 1\nfoo\n"

    sections = convert_to_sections(text)

    assert sections == {'Header 1': 'foo'}

def test_convert_to_sections_two_headers():
    text = "## Header 1\nfoo\n## Header 2\nbar\n"

    sections = convert_to_sections(text)

    assert sections == {'Header 1': 'foo', 'Header 2': 'bar'}

def test_convert_to_sections_three_headers():
    text = "## Header 1\nfoo\n## Header 2\nbar\n## Header 3\nbaz\n"

    sections = convert_to_sections(text)

    assert sections == {'Header 1': 'foo', 'Header 2': 'bar', 'Header 3': 'baz'}

def test_convert_to_sections_sub_headers():
    text = "## Header 1\n### Header 2\nfoo\n"

    sections = convert_to_sections(text)
    print(sections)
    assert sections == {'Header 1': {'Header 2': 'foo'}}

def test_convert_to_sections_sub_sub_headers():
    text = "## Header 1\n### Header 2\n#### Header 3\nfoo\n"

    sections = convert_to_sections(text)
    assert sections == {'Header 1': {'Header 2': {'Header 3': 'foo'}}}
